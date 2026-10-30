import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import {
  cartQueryOptions,
  quoteQueryOptions,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/features/cart/api'
import { ApiError } from '@/shared/api/http-client'
import { CartSummarySkeleton } from '@/shared/components/skeletons/CartSummarySkeleton'
import { DEFAULT_NFT_LIST_QUERY } from '@/shared/contracts'
import { formatEth } from '@/shared/lib/money'

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

function CartPage() {
  const cartQuery = useQuery(cartQueryOptions())
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()

  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined)

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

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 text-center sm:px-6 xl:px-0">
        <h1 className="font-mono text-2xl font-bold text-ink">Seu carrinho está vazio</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Explore o catálogo e encontre arte digital.
        </p>
        <Link
          to="/"
          search={DEFAULT_NFT_LIST_QUERY}
          className="mt-6 inline-flex rounded-[5px] bg-primary px-4 py-2 text-sm font-bold text-ink"
        >
          Explorar NFTs
        </Link>
      </div>
    )
  }

  const couponError = quote.error instanceof ApiError ? quote.error : null

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
      <h1 className="mb-6 font-mono text-2xl font-bold text-ink">Carrinho</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section aria-label="Itens do carrinho">
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-[16px] border border-surface-dark bg-surface-card p-3 text-canvas sm:flex-row sm:items-center"
              >
                <img
                  src={item.imageUrl}
                  alt={`Arte do NFT ${item.name}`}
                  className="aspect-square w-full rounded-xl object-cover sm:size-24 sm:shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold">{item.name}</p>
                  <p className="text-sm text-text-secondary">{formatEth(item.priceEth)} ETH</p>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <span className="text-xs text-text-secondary">Qtd.</span>
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, item.available)}
                    value={item.quantity}
                    onChange={(event) => {
                      const next = Number(event.target.value)
                      const clamped = Math.min(Math.max(1, next || 1), Math.max(1, item.available))
                      updateItem.mutate({ itemId: item.id, quantity: clamped })
                    }}
                    className="w-16 rounded-[6px] border border-surface-dark bg-ink px-2 py-1 text-center text-sm text-canvas"
                    aria-label={`Quantidade de ${item.name}`}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeItem.mutate(item.id)}
                  className="rounded-[5px] border border-surface-dark px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-error/60 hover:text-error"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex flex-col gap-4">
          <div className="rounded-[16px] border border-surface-dark bg-surface-card p-4 text-canvas">
            <h2 className="text-sm font-bold">Cupom</h2>
            {appliedCoupon ? (
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <span className="text-primary">{appliedCoupon}</span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(undefined)}
                  className="text-xs text-text-secondary underline"
                >
                  Remover
                </button>
              </div>
            ) : (
              <form
                className="mt-2 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (couponInput.trim()) setAppliedCoupon(couponInput.trim().toUpperCase())
                }}
              >
                <input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Código"
                  aria-label="Código do cupom"
                  className="min-w-0 flex-1 rounded-[6px] border border-surface-dark bg-ink px-3 py-1.5 text-sm text-canvas"
                />
                <button
                  type="submit"
                  className="rounded-[5px] bg-primary px-3 py-1.5 text-sm font-bold text-ink"
                >
                  Aplicar
                </button>
              </form>
            )}
            {couponError && (
              <p role="alert" className="mt-2 text-xs text-error">
                {couponError.code === 'COUPON_EXPIRED' ? 'Cupom expirado.' : 'Cupom inválido.'}
              </p>
            )}
          </div>

          <div className="rounded-[16px] border border-surface-dark bg-surface-card p-4 text-canvas">
            <h2 className="text-sm font-bold">Resumo</h2>
            {quote.isLoading ? (
              <CartSummarySkeleton lineCount={2} />
            ) : quote.data ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Subtotal</dt>
                  <dd>{formatEth(quote.data.subtotalEth)} ETH</dd>
                </div>
                {quote.data.discountEth !== '0' && (
                  <div className="flex justify-between text-success">
                    <dt>Desconto</dt>
                    <dd>-{formatEth(quote.data.discountEth)} ETH</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-text-secondary">Taxa de rede</dt>
                  <dd>{formatEth(quote.data.networkFeeEth)} ETH</dd>
                </div>
                <div className="flex justify-between border-t border-surface-dark pt-2 text-base font-bold">
                  <dt>Total</dt>
                  <dd className="text-primary">{formatEth(quote.data.totalEth)} ETH</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-error">Não foi possível calcular o total.</p>
            )}

            <Link
              to="/pagamento"
              aria-disabled={!quote.data}
              onClick={(event) => {
                if (!quote.data) event.preventDefault()
              }}
              className="mt-4 inline-flex w-full justify-center rounded-[5px] bg-primary px-4 py-2.5 text-sm font-bold text-ink"
            >
              Finalizar compra
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
