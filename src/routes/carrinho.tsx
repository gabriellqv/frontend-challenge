import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { Minus, Plus, Trash2 } from 'lucide-react'

import {
  cartQueryOptions,
  quoteQueryOptions,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/features/cart/api'
import { ApiError } from '@/shared/api/http-client'
import { CartSummarySkeleton } from '@/shared/components/skeletons/CartSummarySkeleton'
import { DEFAULT_NFT_LIST_QUERY } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'
import { formatEth, mul } from '@/shared/lib/money'

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

const RELATED_NFTS = [
  {
    id: 'nft-19',
    name: 'Cosmic Bloom #118',
    priceEth: '1.29',
    imageUrl: '/images/NFT-Artwork-18.png',
  },
  {
    id: 'nft-20',
    name: 'Violet Nomad #314',
    priceEth: '1.39',
    imageUrl: '/images/NFT-Artwork-18.png',
  },
  {
    id: 'nft-21',
    name: 'Ivory Baron #088',
    priceEth: '1.79',
    imageUrl: '/images/NFT-Artwork-05.png',
  },
  {
    id: 'nft-22',
    name: 'Golden Beat #207',
    priceEth: '0.99',
    imageUrl: '/images/NFT-Artwork-09.png',
  },
  {
    id: 'nft-23',
    name: 'Golden Signal #160',
    priceEth: '0.39',
    imageUrl: '/images/NFT-Artwork-09.png',
  },
]

function CartPage() {
  const cartQuery = useQuery(cartQueryOptions())
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined)
  const [activeDot, setActiveDot] = useState(1)

  const items = cartQuery.data?.items ?? []
  const quoteRequest = {
    items: items.map((item) => ({
      nftId: item.nftId,
      editionId: item.editionId,
      quantity: item.quantity,
    })),
    ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
  }
  const quote = useQuery(quoteQueryOptions(quoteRequest))

  if (cartQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
        <CartSummarySkeleton />
      </div>
    )
  }

  const couponError = quote.error instanceof ApiError ? quote.error : null

  function getItemImage(item: (typeof items)[number]) {
    if (item.nftId === 'nft-1' || item.name.includes('Emerald Ape')) {
      return '/images/Frame-136.png'
    }
    return item.imageUrl
  }

  function getItemTokenId(item: (typeof items)[number]) {
    if (item.nftId === 'nft-1') return '#0042'
    if (item.nftId === 'nft-20') return '#0009'
    if (item.nftId === 'nft-21') return '#0552'
    return `#${item.nftId.replace('nft-', '00')}`
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[96px] px-4 py-6 sm:px-6 lg:px-[120px]">
      {/* Top Section: Breadcrumb + Cart Body */}
      <section aria-label="Carrinho de NFTs" className="flex w-full flex-col gap-8">
        {/* Breadcrumb: Início / Mercado / Carrinho */}
        <nav
          aria-label="Breadcrumb"
          className="flex h-4 items-center gap-2 font-mono text-[15px] leading-4 font-bold text-[#F5F1EB]"
        >
          <Link
            to="/"
            search={DEFAULT_NFT_LIST_QUERY}
            className="transition-colors hover:text-primary"
          >
            Início
          </Link>
          <span className="text-[#F5F1EB]">/</span>
          <Link
            to="/"
            search={DEFAULT_NFT_LIST_QUERY}
            className="transition-colors hover:text-primary"
          >
            Mercado
          </Link>
          <span className="text-[#F5F1EB]">/</span>
          <span className="text-[#F5F1EB]">Carrinho</span>
        </nav>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[12px] border border-[#3F2319] bg-[#241612] px-6 py-16 text-center">
            <h1 className="font-mono text-2xl font-bold text-[#F5F1EB]">Seu carrinho está vazio</h1>
            <p className="mt-2 font-mono text-sm text-[#CFB28C]">
              Explore o catálogo e adicione colecionáveis digitais exclusivos.
            </p>
            <Link
              to="/"
              search={DEFAULT_NFT_LIST_QUERY}
              className="mt-6 inline-flex rounded-[6px] bg-primary px-6 py-2.5 font-mono text-sm font-bold text-[#140D0A] transition-colors hover:bg-highlight"
            >
              Explorar NFTs
            </Link>
          </div>
        ) : (
          /* Cart Body: Left (Table 782px) + Right (Summary 332px) */
          <div className="flex w-full flex-col justify-between gap-8 lg:flex-row lg:items-start lg:gap-12">
            {/* Cart Table: 782px wide */}
            <div className="flex w-full flex-1 flex-col gap-3 lg:max-w-[782px]">
              {/* Table Header: NFTs, Preço, Edições, Total */}
              <div className="hidden h-4 w-full items-center justify-between pr-6 font-mono text-[16px] leading-4 sm:flex">
                <span className="w-[250px] font-bold text-[#F5F1EB]">NFTs</span>
                <span className="w-[77px] text-center font-medium text-[#F5F1EB]">Preço</span>
                <span className="w-[75px] text-center font-bold text-[#F5F1EB]">Edições</span>
                <span className="w-[87px] text-center font-medium text-[#F5F1EB]">Total</span>
                <span className="w-[24px]" aria-hidden="true" />
              </div>

              {/* Line 2 */}
              <div className="hidden w-full border-b border-[#D28A4C]/30 pt-1 sm:block" />

              {/* Cart Items List */}
              <ul className="flex flex-col gap-3">
                {items.map((item) => {
                  const itemTotalEth = mul(item.priceEth, item.quantity.toString())
                  const imgSrc = getItemImage(item)
                  const tokenId = getItemTokenId(item)

                  return (
                    <li
                      key={item.id}
                      className="flex min-h-[70px] w-full flex-col justify-between rounded-[6px] bg-[#241612] p-3 transition-colors sm:h-[70px] sm:flex-row sm:items-center sm:p-0 sm:pr-6"
                    >
                      {/* 1. NFT Info: Image (70x70) + Title/ID */}
                      <div className="flex items-center gap-4 sm:w-[250px]">
                        <img
                          src={imgSrc}
                          alt={item.name}
                          className="size-[70px] shrink-0 rounded-[6px] object-cover"
                        />
                        <div className="flex min-w-0 flex-col gap-1.5 font-mono">
                          <Link
                            to="/nft/$nftId"
                            params={{ nftId: item.nftId }}
                            className="truncate text-[16px] leading-4 font-bold text-[#F5F1EB] transition-colors hover:text-primary"
                          >
                            {item.name}
                          </Link>
                          <span className="text-[14px] leading-4 font-normal text-[#B39463]">
                            ID do token: {tokenId}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Row with Price, Stepper, Total, Delete */}
                      <div className="mt-3 flex items-center justify-between sm:mt-0 sm:contents">
                        {/* 2. Unit Price */}
                        <div className="font-mono text-[16px] leading-4 font-bold text-[#CFB28C] sm:w-[77px] sm:text-center">
                          {formatEth(item.priceEth)} ETH
                        </div>

                        {/* 3. Stepper: Minus (20x30 pill) + Qty + Plus (20x30 pill) */}
                        <div className="flex h-[30px] items-center justify-center gap-3 sm:w-[75px]">
                          <button
                            type="button"
                            aria-label={`Diminuir quantidade de ${item.name}`}
                            disabled={item.quantity <= 1}
                            onClick={() => {
                              const next = Math.max(1, item.quantity - 1)
                              updateItem.mutate({ itemId: item.id, quantity: next })
                            }}
                            className="flex h-[30px] w-[20px] cursor-pointer items-center justify-center rounded-[20px] border border-[#140D0A] bg-primary text-[#000000] shadow-[0px_4px_12px_-2px_rgba(20,13,10,0.15)] transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus aria-hidden="true" className="size-3.5 stroke-[2.5]" />
                          </button>
                          <span className="min-w-[11px] text-center font-mono text-[17px] leading-6 font-normal text-[#F5F1EB]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Aumentar quantidade de ${item.name}`}
                            disabled={item.quantity >= Math.max(1, item.available)}
                            onClick={() => {
                              const next = Math.min(Math.max(1, item.available), item.quantity + 1)
                              updateItem.mutate({ itemId: item.id, quantity: next })
                            }}
                            className="flex h-[30px] w-[20px] cursor-pointer items-center justify-center rounded-[20px] border border-[#140D0A] bg-primary text-[#000000] shadow-[0px_4px_12px_-2px_rgba(20,13,10,0.15)] transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus aria-hidden="true" className="size-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* 4. Item Total */}
                        <div className="font-mono text-[16px] leading-4 font-bold text-[#E89B55] sm:w-[87px] sm:text-center">
                          {formatEth(itemTotalEth)} ETH
                        </div>

                        {/* 5. Delete Button */}
                        <div className="flex items-center justify-end sm:w-[24px]">
                          <button
                            type="button"
                            onClick={() => removeItem.mutate(item.id)}
                            aria-label={`Remover ${item.name} do carrinho`}
                            className="p-1 text-[#B39463] transition-colors hover:text-[#E89B55]"
                          >
                            <Trash2 aria-hidden="true" className="size-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Wallet Summary: 332px wide */}
            <aside
              aria-label="Resumo da carteira"
              className="flex w-full flex-col gap-6 lg:w-[332px] lg:shrink-0"
            >
              {/* Heading */}
              <div className="flex flex-col gap-3">
                <h2 className="font-mono text-[18px] leading-4 font-bold text-[#F5F1EB]">
                  Resumo da carteira
                </h2>
                <div className="w-full border-b border-[#D28A4C]/30" />
              </div>

              {/* Promo Code */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="promo-code-input"
                  className="font-mono text-[14px] leading-4 font-bold text-[#F5F1EB]"
                >
                  Código promocional
                </label>

                {appliedCoupon ? (
                  <div className="flex h-[40px] items-center justify-between rounded-[3px] border border-primary bg-primary/10 px-3 font-mono text-[14px]">
                    <span className="font-bold text-[#E89B55]">{appliedCoupon}</span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(undefined)}
                      className="text-xs text-[#CFB28C] underline hover:text-foreground"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (couponInput.trim()) {
                        setAppliedCoupon(couponInput.trim().toUpperCase())
                      }
                    }}
                    className="flex h-[40px] w-full items-center rounded-[3px] border border-primary"
                  >
                    <input
                      id="promo-code-input"
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Digite o código promocional..."
                      className="h-full min-w-0 flex-1 bg-transparent px-2 font-mono text-[12px] leading-4 text-[#F5F1EB] placeholder:text-[#B39463] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="flex h-[40px] w-[102px] shrink-0 cursor-pointer items-center justify-center rounded-r-[2px] bg-primary font-mono text-[15px] leading-4 font-bold text-[#140D0A] transition-colors hover:bg-highlight"
                    >
                      Aplicar
                    </button>
                  </form>
                )}
                {couponError && (
                  <p role="alert" className="font-mono text-xs text-error">
                    {couponError.code === 'COUPON_EXPIRED' ? 'Cupom expirado.' : 'Cupom inválido.'}
                  </p>
                )}
              </div>

              {/* Fees / Totals */}
              <div className="flex flex-col gap-3 font-mono">
                {/* Subtotal */}
                <div className="flex items-center justify-between">
                  <span className="text-[15px] leading-5 font-normal text-[#F5F1EB]">Subtotal</span>
                  <span className="text-[18px] leading-4 font-normal text-[#F5F1EB]">
                    {quote.data ? `${formatEth(quote.data.subtotalEth)} ETH` : '—'}
                  </span>
                </div>

                {/* Desconto do lançamento */}
                <div className="flex items-center justify-between">
                  <span className="text-[15px] leading-5 font-normal text-[#F5F1EB]">
                    Desconto do lançamento
                  </span>
                  <span className="text-[15px] leading-5 font-normal text-[#F5F1EB]">
                    {quote.data && quote.data.discountEth !== '0'
                      ? `(-) ${formatEth(quote.data.discountEth)} ETH`
                      : '(-) 00.00'}
                  </span>
                </div>

                {/* Taxa de rede */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[15px] leading-5 font-normal text-[#F5F1EB]">
                      Taxa de rede
                    </span>
                    <span className="text-[18px] leading-4 font-normal text-[#F5F1EB]">
                      {quote.data ? `${formatEth(quote.data.networkFeeEth)} ETH` : '—'}
                    </span>
                  </div>
                  <span className="text-right text-[12px] leading-4 font-normal text-[#E89B55]">
                    Taxa estimada
                  </span>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[16px] leading-4 font-bold text-[#F5F1EB]">Total</span>
                  <span className="text-[18px] leading-4 font-bold text-[#E89B55]">
                    {quote.data ? `${formatEth(quote.data.totalEth)} ETH` : '—'}
                  </span>
                </div>
              </div>

              {/* Checkout CTA Buttons */}
              <div className="flex flex-col items-center gap-3 pt-2">
                <Link
                  to="/pagamento"
                  aria-label="Finalizar compra"
                  className={cn(
                    'flex h-[40px] w-full cursor-pointer items-center justify-center rounded-[3px] bg-primary font-mono text-[15px] leading-4 font-bold text-[#140D0A] transition-colors hover:bg-highlight',
                    (!quote.data || items.length === 0) &&
                      'pointer-events-none cursor-not-allowed opacity-50',
                  )}
                >
                  Conectar e finalizar
                </Link>

                <Link
                  to="/"
                  search={DEFAULT_NFT_LIST_QUERY}
                  className="font-mono text-[15px] leading-5 font-normal text-[#E89B55] transition-colors hover:underline"
                >
                  Continuar explorando
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* Related Products: "Colecionadores também viram" */}
      <section aria-labelledby="related-heading" className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h2
            id="related-heading"
            className="font-mono text-[17px] leading-4 font-bold text-[#E89B55]"
          >
            Colecionadores também viram
          </h2>
          <div className="w-full border-b border-[#D28A4C]/30" />
        </div>

        {/* 5 Cards Row */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:flex lg:justify-between lg:gap-[28px]">
          {RELATED_NFTS.map((item) => (
            <Link
              key={item.id}
              to="/nft/$nftId"
              params={{ nftId: item.id }}
              className="group flex flex-col gap-2 lg:w-[219px]"
            >
              <div className="flex h-[255px] w-full items-center justify-center rounded-[17px] bg-[#241612] p-2 transition-transform group-hover:scale-[1.02]">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="size-[212px] max-h-full max-w-full rounded-[15px] object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 font-mono pt-1">
                <p className="truncate text-[15px] leading-5 text-[#F5F1EB] transition-colors group-hover:text-primary">
                  {item.name}
                </p>
                <p className="text-[16px] leading-4 font-bold text-[#E89B55]">
                  {item.priceEth} ETH
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Carousel Dots */}
        <div
          className="flex items-center justify-center gap-2 pt-2"
          aria-label="Navegação do carrossel"
        >
          <button
            type="button"
            onClick={() => setActiveDot(0)}
            aria-label="Página anterior"
            className={cn(
              'size-[12px] cursor-pointer rounded-full transition-colors',
              activeDot === 0 ? 'bg-primary' : 'border-[1.3px] border-primary',
            )}
          />
          <button
            type="button"
            onClick={() => setActiveDot(1)}
            aria-label="Página atual"
            className={cn(
              'size-[12px] cursor-pointer rounded-full transition-colors',
              activeDot === 1 ? 'bg-primary' : 'border-[1.3px] border-primary',
            )}
          />
          <button
            type="button"
            onClick={() => setActiveDot(2)}
            aria-label="Próxima página"
            className={cn(
              'size-[12px] cursor-pointer rounded-full transition-colors',
              activeDot === 2 ? 'bg-primary' : 'border-[1.3px] border-primary',
            )}
          />
        </div>
      </section>
    </div>
  )
}
