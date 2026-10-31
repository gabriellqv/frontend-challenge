import { useEffect, useRef, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'

import { ChevronDown } from 'lucide-react'

import { profileQueryOptions, walletsQueryOptions } from '@/features/account/api'
import { cartQueryOptions, quoteQueryOptions } from '@/features/cart/api'
import { useCreateOrder } from '@/features/orders/api'
import { ApiError } from '@/shared/api/http-client'
import { CartSummarySkeleton } from '@/shared/components/skeletons/CartSummarySkeleton'
import { DEFAULT_NFT_LIST_QUERY } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'
import { createIdempotencyKey } from '@/shared/lib/hash'
import { formatEth, mul } from '@/shared/lib/money'
import { getToken } from '@/shared/session'

const IDEMPOTENCY_STORAGE_KEY = 'kurio:checkout-idempotency'

export const Route = createFileRoute('/pagamento')({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: '/login', search: { redirect: '/pagamento' } })
  },
  component: CheckoutPage,
})

/** Chave estável por tentativa: sobrevive a refresh/timeout e evita compra dupla. */
function useCheckoutIdempotencyKey(): string {
  const [key] = useState(() => {
    const stored = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY)
    if (stored) return stored
    const created = createIdempotencyKey()
    sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, created)
    return created
  })
  return key
}

function getItemTokenId(nftId: string) {
  if (nftId === 'nft-1') return '#0042'
  if (nftId === 'nft-20') return '#0314'
  if (nftId === 'nft-21') return '#0088'
  const num = nftId.replace(/\D/g, '').padStart(4, '0')
  return `#${num}`
}

const DEMO_ITEMS = [
  {
    id: 'demo-1',
    nftId: 'nft-1',
    editionId: 'ed-1',
    name: 'Emerald Ape #042',
    imageUrl: '/images/Frame-136.png',
    quantity: 2,
    totalEth: '2.38 ETH',
    tokenId: '#0042',
  },
  {
    id: 'demo-2',
    nftId: 'nft-20',
    editionId: 'ed-20',
    name: 'Violet Nomad #314',
    imageUrl: '/images/NFT-Artwork-18.png',
    quantity: 6,
    totalEth: '8.34 ETH',
    tokenId: '#0314',
  },
  {
    id: 'demo-3',
    nftId: 'nft-21',
    editionId: 'ed-21',
    name: 'Ivory Baron #088',
    imageUrl: '/images/NFT-Artwork-05.png',
    quantity: 9,
    totalEth: '16.11 ETH',
    tokenId: '#0088',
  },
]

function CheckoutPage() {
  const navigate = Route.useNavigate()
  const idempotencyKey = useCheckoutIdempotencyKey()

  const cartQuery = useQuery(cartQueryOptions())
  const walletsQuery = useQuery(walletsQueryOptions())
  const profileQuery = useQuery(profileQueryOptions())
  const createOrder = useCreateOrder()

  const [selectedWalletOption, setSelectedWalletOption] = useState<
    'supported' | 'metamask' | 'coinbase'
  >('coinbase')
  const [selectedNetwork, setSelectedNetwork] = useState('Ethereum')
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false)
  const [selectedWalletType, setSelectedWalletType] = useState('Coinbase Wallet')
  const [isWalletTypeDropdownOpen, setIsWalletTypeDropdownOpen] = useState(false)
  const [selectedEnsDomain, setSelectedEnsDomain] = useState('.eth')
  const [isEnsDropdownOpen, setIsEnsDropdownOpen] = useState(false)

  const networkDropdownRef = useRef<HTMLDivElement>(null)
  const walletTypeDropdownRef = useRef<HTMLDivElement>(null)
  const ensDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        networkDropdownRef.current &&
        !networkDropdownRef.current.contains(event.target as Node)
      ) {
        setIsNetworkDropdownOpen(false)
      }
      if (
        walletTypeDropdownRef.current &&
        !walletTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWalletTypeDropdownOpen(false)
      }
      if (ensDropdownRef.current && !ensDropdownRef.current.contains(event.target as Node)) {
        setIsEnsDropdownOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNetworkDropdownOpen(false)
        setIsWalletTypeDropdownOpen(false)
        setIsEnsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const [useOtherWallet, setUseOtherWallet] = useState(false)
  const [collectorNote, setCollectorNote] = useState('')

  // Campos do formulário
  const [displayName, setDisplayName] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [profileName, setProfileName] = useState('')
  const [ensSecondary, setEnsSecondary] = useState('')
  const [referralCode, setReferralCode] = useState('')

  // Cupom
  const [showPromoInput, setShowPromoInput] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined)

  const cartItems = cartQuery.data?.items ?? []
  const hasRealItems = cartItems.length > 0
  const wallets = walletsQuery.data ?? []
  const wallet = wallets[0]

  const currentDisplayName = displayName || profileQuery.data?.name || ''
  const currentEmail = email || profileQuery.data?.email || ''
  const currentUsername =
    username ||
    (profileQuery.data?.name ? profileQuery.data.name.toLowerCase().replace(/\s+/g, '') : '')
  const currentProfileName = profileName || profileQuery.data?.name || ''
  const currentWalletAddress = walletAddress || wallet?.address || ''

  const quoteRequest = {
    items: cartItems.map((item) => ({
      nftId: item.nftId,
      editionId: item.editionId,
      quantity: item.quantity,
    })),
    ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
  }
  const quote = useQuery(quoteQueryOptions(quoteRequest))
  const couponError = quote.error instanceof ApiError ? quote.error : null
  const orderError = createOrder.error instanceof ApiError ? createOrder.error : null

  if (cartQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-[120px]">
        <CartSummarySkeleton />
      </div>
    )
  }

  const displayItems = hasRealItems
    ? cartItems.map((item) => ({
        id: item.id,
        nftId: item.nftId,
        editionId: item.editionId,
        name: item.name,
        imageUrl: item.nftId === 'nft-1' ? '/images/Frame-136.png' : item.imageUrl,
        quantity: item.quantity,
        totalEth: `${formatEth(mul(item.priceEth, item.quantity.toString()))} ETH`,
        tokenId: getItemTokenId(item.nftId),
      }))
    : DEMO_ITEMS

  const subtotalEthText = hasRealItems
    ? quote.data
      ? `${formatEth(quote.data.subtotalEth)} ETH`
      : '—'
    : '26.83 ETH'

  const discountEthText = hasRealItems
    ? quote.data && quote.data.discountEth !== '0'
      ? `(-) ${formatEth(quote.data.discountEth)} ETH`
      : '(-) 00.00'
    : '(-) 00.00'

  const networkFeeEthText = hasRealItems
    ? quote.data
      ? `${formatEth(quote.data.networkFeeEth)} ETH`
      : '0.016 ETH'
    : '0.016 ETH'

  const totalEthText = hasRealItems
    ? quote.data
      ? `${formatEth(quote.data.totalEth)} ETH`
      : '—'
    : '26.846 ETH'

  function submit() {
    const effectiveItems = hasRealItems
      ? cartItems.map((item) => ({
          nftId: item.nftId,
          editionId: item.editionId,
          quantity: item.quantity,
        }))
      : [{ nftId: 'nft-1', editionId: 'ed-1', quantity: 1 }]

    const effectiveWallet = wallet ?? {
      address: currentWalletAddress || '0x7aB8…9f3D',
      network: selectedNetwork || 'Polygon',
    }

    createOrder.mutate(
      {
        body: {
          items: effectiveItems,
          ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
          walletAddress: effectiveWallet.address,
          network: (effectiveWallet.network as 'Ethereum' | 'Polygon') || 'Polygon',
        },
        idempotencyKey,
      },
      {
        onSuccess: (order) => {
          sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY)
          navigate({ to: '/pedido/$orderId', params: { orderId: order.id } })
        },
      },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[96px] px-4 py-6 sm:px-6 lg:px-[120px]">
      {/* Checkout Page Content */}
      <section aria-label="Página de Pagamento" className="flex w-full flex-col gap-8">
        {/* Breadcrumb: Início / Mercado / Pagamento */}
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
          <span className="text-[#F5F1EB]">Pagamento</span>
        </nav>

        {/* Main Columns: Perfil do colecionador (763px) + Seus NFTs (405px) */}
        <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          {/* Left Column: Perfil do colecionador */}
          <div className="flex w-full flex-1 flex-col gap-3 lg:max-w-[763px]">
            <h2 className="font-mono text-[17px] leading-4 font-bold text-[#F5F1EB]">
              Perfil do colecionador
            </h2>

            <div className="flex flex-col gap-6">
              {/* Two columns of inputs */}
              <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Column 1 */}
                <div className="flex flex-col gap-3">
                  {/* Nome de exibição* */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="displayName"
                      className="flex h-[29px] items-center font-mono text-[15px] leading-[15px] font-normal text-[#F5F1EB]"
                    >
                      Nome de exibição
                      <span className="ml-0.5 text-[22px] leading-[29px] text-[#F0805F]">*</span>
                    </label>
                    <input
                      id="displayName"
                      type="text"
                      value={currentDisplayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Rede* */}
                  <div className="relative flex flex-col">
                    <label
                      htmlFor="networkSelect"
                      className="flex h-[29px] items-center gap-1 font-mono text-[15px] leading-[15px] font-normal text-[#F5F1EB]"
                    >
                      Rede<span className="text-[22px] leading-[29px] text-[#F0805F]">*</span>
                    </label>
                    <div ref={networkDropdownRef} className="relative">
                      <button
                        id="networkSelect"
                        type="button"
                        onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                        className={cn(
                          'flex h-[40px] w-full items-center justify-between rounded-[3px] border border-[#3F2319] bg-transparent px-3 py-3 font-mono text-[14px] leading-[15px] outline-none transition-colors hover:border-[#D28A4C]/60 focus:border-primary',
                          isNetworkDropdownOpen && 'border-primary',
                          selectedNetwork ? 'text-[#F5F1EB]' : 'text-[#B39463]',
                        )}
                      >
                        <span>{selectedNetwork || 'Selecione uma rede'}</span>
                        <ChevronDown
                          className={cn(
                            'size-[18px] text-[#B39463] transition-transform duration-200',
                            isNetworkDropdownOpen && 'rotate-180',
                          )}
                        />
                      </button>
                      {isNetworkDropdownOpen && (
                        <div className="absolute left-0 top-[42px] z-20 w-full rounded-[3px] border border-[#3F2319] bg-[#241612] py-1 shadow-lg">
                          {['Ethereum', 'Polygon', 'Arbitrum', 'Optimism'].map((net) => (
                            <button
                              key={net}
                              type="button"
                              onClick={() => {
                                setSelectedNetwork(net)
                                setIsNetworkDropdownOpen(false)
                              }}
                              className="flex w-full px-3 py-2 text-left font-mono text-[14px] text-[#F5F1EB] transition-colors hover:bg-[#38220F]"
                            >
                              {net}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Endereço da carteira* */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="walletAddress"
                      className="flex h-[29px] items-center font-mono text-[15px] leading-[15px] font-normal text-[#F5F1EB]"
                    >
                      Endereço da carteira
                      <span className="ml-0.5 text-[22px] leading-[29px] text-[#F0805F]">*</span>
                    </label>
                    <input
                      id="walletAddress"
                      type="text"
                      value={currentWalletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Endereço 0x da carteira"
                      className="h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Tipo de carteira* */}
                  <div className="relative flex flex-col">
                    <label
                      htmlFor="walletTypeSelect"
                      className="flex h-[29px] items-center font-mono text-[15px] leading-[15px] font-normal text-[#F5F1EB]"
                    >
                      Tipo de carteira
                      <span className="ml-0.5 text-[22px] leading-[29px] text-[#F0805F]">*</span>
                    </label>
                    <div ref={walletTypeDropdownRef} className="relative">
                      <button
                        id="walletTypeSelect"
                        type="button"
                        onClick={() => setIsWalletTypeDropdownOpen(!isWalletTypeDropdownOpen)}
                        className={cn(
                          'flex h-[40px] w-full items-center justify-between rounded-[3px] border border-[#3F2319] bg-transparent px-3 py-3 font-mono text-[14px] leading-[15px] outline-none transition-colors hover:border-[#D28A4C]/60 focus:border-primary',
                          isWalletTypeDropdownOpen && 'border-primary',
                          selectedWalletType ? 'text-[#F5F1EB]' : 'text-[#B39463]',
                        )}
                      >
                        <span>{selectedWalletType || 'Selecione uma carteira'}</span>
                        <ChevronDown
                          className={cn(
                            'size-[18px] text-[#B39463] transition-transform duration-200',
                            isWalletTypeDropdownOpen && 'rotate-180',
                          )}
                        />
                      </button>
                      {isWalletTypeDropdownOpen && (
                        <div className="absolute left-0 top-[42px] z-20 w-full rounded-[3px] border border-[#3F2319] bg-[#241612] py-1 shadow-lg">
                          {['Coinbase Wallet', 'MetaMask', 'WalletConnect', 'Phantom'].map(
                            (wType) => (
                              <button
                                key={wType}
                                type="button"
                                onClick={() => {
                                  setSelectedWalletType(wType)
                                  setIsWalletTypeDropdownOpen(false)
                                }}
                                className="flex w-full px-3 py-2 text-left font-mono text-[14px] text-[#F5F1EB] transition-colors hover:bg-[#38220F]"
                              >
                                {wType}
                              </button>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* E-mail* */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="emailInput"
                      className="flex h-[29px] items-center font-mono text-[15px] leading-[15px] font-normal text-[#F5F1EB]"
                    >
                      E-mail
                      <span className="ml-0.5 text-[22px] leading-[29px] text-[#F0805F]">*</span>
                    </label>
                    <input
                      id="emailInput"
                      type="email"
                      value={currentEmail}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-3">
                  {/* Nome de usuário* */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="usernameInput"
                      className="flex h-[29px] items-center font-mono text-[15px] leading-[15px] font-normal text-[#F5F1EB]"
                    >
                      Nome de usuário
                      <span className="ml-0.5 text-[22px] leading-[29px] text-[#F0805F]">*</span>
                    </label>
                    <input
                      id="usernameInput"
                      type="text"
                      value={currentUsername}
                      onChange={(e) => setUsername(e.target.value)}
                      className="h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Nome do perfil* */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="profileNameInput"
                      className="flex h-[29px] items-center font-mono text-[15px] leading-[15px] font-normal text-[#F5F1EB]"
                    >
                      Nome do perfil
                      <span className="ml-0.5 text-[22px] leading-[29px] text-[#F0805F]">*</span>
                    </label>
                    <input
                      id="profileNameInput"
                      type="text"
                      value={currentProfileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* ENS ou carteira secundária (opcional) */}
                  <div className="flex h-[69px] flex-col justify-end">
                    <input
                      id="ensSecondaryInput"
                      type="text"
                      value={ensSecondary}
                      onChange={(e) => setEnsSecondary(e.target.value)}
                      placeholder="ENS ou carteira secundária (opcional)"
                      className="h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Código de indicação* */}
                  <div className="flex flex-col">
                    <label
                      htmlFor="referralCodeInput"
                      className="flex h-[29px] items-center font-mono text-[15px] leading-[15px] font-normal text-[#F5F1EB]"
                    >
                      Código de indicação
                      <span className="ml-0.5 text-[22px] leading-[29px] text-[#F0805F]">*</span>
                    </label>
                    <input
                      id="referralCodeInput"
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="h-[40px] w-full rounded-[3px] border border-[#3F2319] bg-transparent px-3 font-mono text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] focus:border-primary focus:outline-none"
                    />
                  </div>

                  {/* Nome ENS* */}
                  <div className="relative flex flex-col">
                    <label
                      htmlFor="ensNameInput"
                      className="flex h-[29px] items-center gap-1 font-mono text-[15px] leading-[15px] font-normal text-[#F5F1EB]"
                    >
                      Nome ENS<span className="text-[22px] leading-[29px] text-[#F0805F]">*</span>
                    </label>
                    <div ref={ensDropdownRef} className="relative">
                      <button
                        id="ensNameInput"
                        type="button"
                        onClick={() => setIsEnsDropdownOpen(!isEnsDropdownOpen)}
                        className={cn(
                          'flex h-[40px] w-[78px] items-center justify-between rounded-[3px] border border-[#3F2319] bg-transparent px-2.5 py-2 font-mono text-[15px] text-[#F5F1EB] outline-none transition-colors hover:border-[#D28A4C]/60 focus:border-primary',
                          isEnsDropdownOpen && 'border-primary',
                        )}
                      >
                        <span>{selectedEnsDomain}</span>
                        <ChevronDown
                          className={cn(
                            'size-[18px] text-[#F5F1EB] transition-transform duration-200',
                            isEnsDropdownOpen && 'rotate-180',
                          )}
                        />
                      </button>
                      {isEnsDropdownOpen && (
                        <div className="absolute left-0 top-[42px] z-20 w-[90px] rounded-[3px] border border-[#3F2319] bg-[#241612] py-1 shadow-lg">
                          {['.eth', '.xyz', '.id'].map((domain) => (
                            <button
                              key={domain}
                              type="button"
                              onClick={() => {
                                setSelectedEnsDomain(domain)
                                setIsEnsDropdownOpen(false)
                              }}
                              className="flex w-full px-3 py-1.5 text-left font-mono text-[14px] text-[#F5F1EB] transition-colors hover:bg-[#38220F]"
                            >
                              {domain}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Usar outra carteira? */}
              <button
                type="button"
                onClick={() => setUseOtherWallet(!useOtherWallet)}
                className="flex cursor-pointer items-center gap-2 text-left focus:outline-none"
              >
                <span
                  className={cn(
                    'flex size-[15px] items-center justify-center rounded-full border-2 border-primary transition-colors',
                    useOtherWallet ? 'bg-primary' : 'bg-transparent',
                  )}
                >
                  {useOtherWallet && <span className="size-1 rounded-full bg-[#140D0A]" />}
                </span>
                <span className="font-mono text-[15px] leading-5 font-normal text-[#F5F1EB]">
                  Usar outra carteira?
                </span>
              </button>

              {/* Observação do colecionador (opcional) */}
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="collectorNote"
                  className="font-mono text-[15px] leading-[15px] font-normal text-[#F5F1EB]"
                >
                  Observação do colecionador (opcional)
                </label>
                <textarea
                  id="collectorNote"
                  value={collectorNote}
                  onChange={(e) => setCollectorNote(e.target.value)}
                  rows={5}
                  className="h-[152px] w-[350px] max-w-full resize-none rounded-[3px] border border-[#3F2319] bg-transparent p-3 font-mono text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Seus NFTs */}
          <div className="flex w-full flex-col gap-3 lg:w-[405px]">
            <h2 className="font-mono text-[17px] leading-4 font-bold text-[#F5F1EB]">Seus NFTs</h2>

            {/* Header: NFTs & Subtotal + Line 2 */}
            <div className="flex flex-col gap-3">
              <div className="flex h-4 items-center justify-between font-mono">
                <span className="text-[16px] leading-4 font-bold text-[#F5F1EB]">NFTs</span>
                <span className="text-[16px] leading-4 font-medium text-[#F5F1EB]">Subtotal</span>
              </div>
              <div className="w-full border-b-[0.3px] border-[#D28A4C]" />
            </div>

            {/* List of NFT Cards */}
            <div className="flex flex-col gap-3">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  className="flex h-[70px] w-full items-center justify-between rounded-[8px] bg-[#241612] pl-1 pr-4"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="size-[70px] shrink-0 rounded-[8px] object-cover"
                    />
                    <div className="flex flex-col gap-1.5 font-mono">
                      <span className="whitespace-nowrap text-[16px] leading-4 font-bold text-[#F5F1EB]">
                        {item.name}
                      </span>
                      <span className="whitespace-nowrap text-[14px] leading-4 font-normal text-[#B39463]">
                        ID do token: {item.tokenId}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 font-mono">
                    <span className="whitespace-nowrap text-right text-[14px] leading-4 font-normal text-[#CFB28C]">
                      (x {item.quantity})
                    </span>
                    <span className="whitespace-nowrap text-right text-[18px] leading-4 font-bold text-[#E89B55]">
                      {item.totalEth}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code & Totals Breakdown */}
            <div className="flex flex-col items-center gap-3 pt-3 font-mono">
              {appliedCoupon ? (
                <div className="flex w-full items-center justify-between rounded-[3px] border border-[#3F2319] bg-[#241612] px-3 py-2 text-[14px]">
                  <span className="font-bold text-[#E89B55]">Cupom: {appliedCoupon}</span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(undefined)}
                    className="text-[12px] text-[#CFB28C] underline hover:text-[#F5F1EB]"
                  >
                    Remover
                  </button>
                </div>
              ) : showPromoInput ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (couponInput.trim()) {
                      setAppliedCoupon(couponInput.trim().toUpperCase())
                      setShowPromoInput(false)
                    }
                  }}
                  className="flex w-full gap-2"
                >
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Código do cupom"
                    className="h-[36px] flex-1 rounded-[3px] border border-[#3F2319] bg-transparent px-3 text-[14px] text-[#F5F1EB] placeholder:text-[#B39463] focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="h-[36px] rounded-[3px] bg-primary px-3 text-[14px] font-bold text-[#140D0A]"
                  >
                    Aplicar
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPromoInput(true)}
                  className="text-[14px] leading-4 font-normal text-[#F5F1EB] transition-colors hover:text-[#E89B55]"
                >
                  Tem um código promocional? Aplique aqui
                </button>
              )}
              {couponError && (
                <p role="alert" className="text-xs text-[#F0805F]">
                  {couponError.code === 'COUPON_EXPIRED' ? 'Cupom expirado.' : 'Cupom inválido.'}
                </p>
              )}

              {/* Subtotal */}
              <div className="flex w-full items-center justify-between">
                <span className="text-[15px] leading-5 font-normal text-[#F5F1EB]">Subtotal</span>
                <span className="text-right text-[18px] leading-4 font-normal text-[#F5F1EB]">
                  {subtotalEthText}
                </span>
              </div>

              {/* Desconto do lançamento */}
              <div className="flex w-full items-center justify-between">
                <span className="text-[15px] leading-5 font-normal text-[#F5F1EB]">
                  Desconto do lançamento
                </span>
                <span className="text-right text-[15px] leading-5 font-normal text-[#F5F1EB]">
                  {discountEthText}
                </span>
              </div>

              {/* Taxa de rede */}
              <div className="flex w-full items-center justify-between">
                <span className="text-[15px] leading-5 font-normal text-[#F5F1EB]">
                  Taxa de rede
                </span>
                <span className="text-right text-[18px] leading-4 font-normal text-[#F5F1EB]">
                  {networkFeeEthText}
                </span>
              </div>

              {/* Taxa estimada */}
              <span className="w-full text-center text-[12px] leading-4 font-normal text-[#E89B55]">
                Taxa estimada
              </span>

              {/* Line 3 */}
              <div className="w-full border-b-[0.3px] border-[#D28A4C]" />

              {/* Total */}
              <div className="flex w-full items-center justify-between">
                <span className="text-[16px] leading-4 font-bold text-[#F5F1EB]">Total</span>
                <span className="text-right text-[18px] leading-4 font-bold text-[#E89B55]">
                  {totalEthText}
                </span>
              </div>
            </div>

            {/* Carteira e rede */}
            <div className="flex flex-col gap-5 pt-3">
              <h3 className="w-full text-center font-mono text-[17px] leading-4 font-bold text-[#F5F1EB]">
                Carteira e rede
              </h3>

              <div className="flex flex-col gap-4">
                {/* Option 1: Supported wallet brands */}
                <button
                  type="button"
                  onClick={() => setSelectedWalletOption('supported')}
                  className={cn(
                    'flex h-[45px] w-full items-center gap-2.5 rounded-[3px] border px-3 transition-colors',
                    selectedWalletOption === 'supported' ? 'border-primary' : 'border-[#3F2319]',
                  )}
                >
                  <span className="flex size-4 items-center justify-center rounded-full border-[1.2px] border-primary">
                    {selectedWalletOption === 'supported' && (
                      <span className="size-2.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <div className="flex h-[26px] items-center rounded-[6px] border border-[#55321F] bg-[#38220F] px-2 font-mono text-[9px] leading-3 font-bold tracking-[0.1px] text-[#E89B55]">
                    METAMASK &nbsp;•&nbsp; WALLETCONNECT &nbsp;•&nbsp; COINBASE
                  </div>
                </button>

                {/* Option 2: MetaMask */}
                <button
                  type="button"
                  onClick={() => setSelectedWalletOption('metamask')}
                  className={cn(
                    'flex h-[45px] w-full items-center gap-2.5 rounded-[3px] border px-3 transition-colors',
                    selectedWalletOption === 'metamask' ? 'border-primary' : 'border-[#3F2319]',
                  )}
                >
                  <span className="flex size-4 items-center justify-center rounded-full border-[1.2px] border-primary">
                    {selectedWalletOption === 'metamask' && (
                      <span className="size-2.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="font-mono text-[15px] leading-5 font-normal text-[#F5F1EB]">
                    MetaMask
                  </span>
                </button>

                {/* Option 3: Coinbase Wallet (Active default) */}
                <button
                  type="button"
                  onClick={() => setSelectedWalletOption('coinbase')}
                  className={cn(
                    'flex h-[45px] w-full items-center gap-3 rounded-[3px] border px-4 transition-colors',
                    selectedWalletOption === 'coinbase' ? 'border-primary' : 'border-[#3F2319]',
                  )}
                >
                  <span className="flex size-4 items-center justify-center rounded-full border-[1.2px] border-primary">
                    {selectedWalletOption === 'coinbase' && (
                      <span className="size-2.5 rounded-full bg-primary" />
                    )}
                  </span>
                  <span className="font-mono text-[15px] leading-5 font-normal text-[#F5F1EB]">
                    Coinbase Wallet
                  </span>
                </button>
              </div>

              {/* Confirmar compra CTA */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  disabled={createOrder.isPending}
                  onClick={submit}
                  className="flex h-[45px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-primary font-mono text-[15px] leading-4 font-bold text-[#140D0A] transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createOrder.isPending ? 'Confirmando…' : 'Confirmar compra'}
                </button>
                {orderError && (
                  <p role="alert" className="text-center font-mono text-xs text-[#F0805F]">
                    {orderError.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
