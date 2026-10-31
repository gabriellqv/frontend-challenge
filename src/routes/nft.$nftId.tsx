import { useEffect, useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import Big from 'big.js'
import {
  ArrowLeft,
  Check,
  Copy,
  Heart,
  Linkedin,
  Mail,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Star,
  Twitter,
  X,
} from 'lucide-react'

import { useAddToCart } from '@/features/cart/api'
import { nftQueryOptions } from '@/features/catalog/api'
import { favoritesQueryOptions, useToggleFavorite } from '@/features/favorites/api'
import { NftDetailSkeleton } from '@/shared/components/skeletons/NftDetailSkeleton'
import { DEFAULT_NFT_LIST_QUERY } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'
import { formatEth } from '@/shared/lib/money'
import { useBodyScrollLock } from '@/shared/lib/useBodyScrollLock'

export const Route = createFileRoute('/nft/$nftId')({
  component: NftDetailPage,
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

const MOCK_REVIEWS = [
  {
    author: 'Kaelen Vance',
    stars: 5,
    date: '28 de Outubro de 2026',
    comment:
      'A qualidade da arte em alta resolução é impressionante. Transação na rede confirmada rapidamente e procedência impecável.',
  },
  {
    author: 'Elena Rostova',
    stars: 5,
    date: '25 de Outubro de 2026',
    comment:
      'Uma das melhores peças da coleção Kurio Apes. A iluminação e os detalhes dos óculos são obras-primas do artista.',
  },
  {
    author: 'Lucas Mendes',
    stars: 5,
    date: '21 de Outubro de 2026',
    comment:
      'Excelente projeto. Curadoria impecável e metadados totalmente acessíveis no IPFS. Super recomendo!',
  },
  {
    author: 'Sofia Chen',
    stars: 4,
    date: '18 de Outubro de 2026',
    comment:
      'Arte espetacular. O contrato ERC-721 verificado dá muita tranquilidade aos colecionadores.',
  },
]

function NftDetailPage() {
  const { nftId } = Route.useParams()
  const navigate = Route.useNavigate()
  const nftQuery = useQuery(nftQueryOptions(nftId))
  const favorites = useQuery(favoritesQueryOptions())
  const toggleFavorite = useToggleFavorite()
  const addToCart = useAddToCart()

  const [selectedEditionId, setSelectedEditionId] = useState<string>('1/50')
  const [selectedThumbnailIdx, setSelectedThumbnailIdx] = useState<number>(1)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'detalhes' | 'avaliacoes'>('detalhes')
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  useBodyScrollLock(isZoomOpen)
  const [activeDot, setActiveDot] = useState(1)
  const [copiedLink, setCopiedLink] = useState(false)

  // ESC key handler for zoom lightbox modal
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsZoomOpen(false)
      }
    }
    if (isZoomOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isZoomOpen])

  if (nftQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
        <NftDetailSkeleton />
      </div>
    )
  }

  if (nftQuery.isError || !nftQuery.data) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 text-center sm:px-6 xl:px-0">
        <h1 className="font-mono text-2xl font-bold text-foreground">NFT não encontrado</h1>
        <p className="mt-2 font-mono text-sm text-text-secondary">
          O NFT que você procura não existe ou foi removido.
        </p>
        <Link
          to="/"
          search={DEFAULT_NFT_LIST_QUERY}
          className="mt-6 inline-flex rounded-[6px] bg-primary px-4 py-2 font-mono text-sm font-bold text-ink transition-colors hover:bg-highlight"
        >
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  const nft = nftQuery.data
  // Emerald Ape #042 uses Frame-136.png (green jacket, sunglasses, emerald pendant)
  const mainArtworkUrl =
    nft.id === 'nft-1' || nft.name.includes('Emerald Ape') ? '/images/Frame-136.png' : nft.imageUrl

  const edition =
    nft.editions.find((item) => item.name === selectedEditionId || item.id === selectedEditionId) ??
    nft.editions[0]
  const available = edition?.available ?? 18
  const isSoldOut = available === 0
  const maxQuantity = Math.max(1, available)
  const isFavorite = favorites.data?.items.some((item) => item.nftId === nft.id) ?? false

  // 4 thumbnails of the artwork; thumbnail index 1 is active by default (matching Figma)
  const thumbnails = [mainArtworkUrl, mainArtworkUrl, mainArtworkUrl, mainArtworkUrl]

  function selectEdition(pillId: string) {
    setSelectedEditionId(pillId)
    setQuantity(1)
  }

  function handleToggleFavorite() {
    toggleFavorite.mutate({ nftId: nft.id, favorite: !isFavorite })
  }

  function handleShare(platform: 'linkedin' | 'email' | 'twitter') {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://kurio.art'
    const shareText = `Confira a obra ${nft.name} da coleção ${nft.collection} no Kurio!`

    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'noopener,noreferrer',
      )
    } else if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        '_blank',
        'noopener,noreferrer',
      )
    } else if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(nft.name + ' no Kurio')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
    }
  }

  const editionPills = [
    { id: '1/1', label: '1/1', widthClass: 'w-[36px]' },
    { id: '1/10', label: '1/10', widthClass: 'w-[42px]' },
    { id: '1/50', label: '1/50', widthClass: 'w-[46px]' },
    { id: 'ABERTA', label: 'ABERTA', widthClass: 'w-[66px]' },
  ]

  return (
    <>
      {/* Mobile / Detalhes do NFT (Figma 414px x 896px) */}
      <div className="relative flex h-full min-h-[100dvh] max-h-[100dvh] w-full flex-col justify-between overflow-hidden bg-[#140D0A] md:hidden">
        {/* Hero Artwork Section */}
        <div
          className="relative flex flex-1 min-h-0 w-full flex-col justify-between p-4 pb-2"
          style={{
            background: 'linear-gradient(143.28deg, #241612 -12%, #2F1D15 106.59%)',
          }}
        >
          {/* Top Actions: Back Button (Left) + Favorite Button (Right) */}
          <div className="z-10 flex shrink-0 w-full items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  window.history.back()
                } else {
                  navigate({ to: '/', search: DEFAULT_NFT_LIST_QUERY })
                }
              }}
              aria-label="Voltar"
              className="flex size-[35px] cursor-pointer items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-[#CFB28C] shadow-sm transition-transform active:scale-95"
            >
              <ArrowLeft className="size-5" />
            </button>

            <button
              type="button"
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              className="flex size-[35px] cursor-pointer items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] shadow-sm transition-transform active:scale-95"
            >
              <Heart
                aria-hidden="true"
                className={cn(
                  'size-4 transition-colors',
                  isFavorite ? 'fill-[#E89B55] text-[#E89B55]' : 'fill-transparent text-[#E89B55]',
                )}
              />
            </button>
          </div>

          {/* Main Hero Artwork */}
          <div className="my-auto flex flex-1 min-h-0 w-full items-center justify-center py-1">
            <img
              src={mainArtworkUrl}
              alt={nft.name}
              className="max-h-full max-w-[280px] sm:max-w-[320px] aspect-square cursor-zoom-in rounded-[24px] border border-[#D28A4C]/15 object-cover shadow-2xl"
              onClick={() => setIsZoomOpen(true)}
            />
          </div>

          {/* Group 62: Carousel indicator (pill + dots) */}
          <div className="flex shrink-0 items-center justify-center gap-1.5 py-1">
            <span className="h-[7px] w-[28px] rounded-[25px] bg-[#D28A4C]" />
            <span className="size-[7px] rounded-full bg-[#D28A4C]" />
            <span className="size-[7px] rounded-full bg-[#D28A4C]" />
          </div>
        </div>

        {/* Details Sheet */}
        <div className="relative z-10 flex shrink-0 w-full flex-col gap-3 rounded-t-[31px] bg-[#241612] px-6 pt-4 pb-3 shadow-xl">
          {/* Title Row: Name + Rating Badge */}
          <div className="flex items-center justify-between gap-2">
            <h1 className="truncate font-mono text-[19px] font-bold leading-5 text-[#F5F1EB]">
              {nft.name}
            </h1>

            {/* Rating badge (Rectangle 99 + Group 63) */}
            <div
              role="img"
              aria-label="Avaliação 4.8 de 19 colecionadores"
              className="flex h-[26px] shrink-0 items-center gap-1.5 rounded-[32px] border border-[#D28A4C] px-2.5"
            >
              <Star className="size-3.5 fill-[#E3A44E] text-[#E3A44E]" />
              <span className="font-mono text-[13px] font-medium leading-4 text-[#F5F1EB]">
                4.8
              </span>
              <span className="font-mono text-[13px] font-normal leading-4 text-[#CFB28C]">
                (19)
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="line-clamp-2 font-mono text-[13px] font-normal leading-5 text-[#CFB28C]">
            {nft.description ||
              'Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum.'}
          </p>

          {/* Frame 66: Edition selector */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[14px] font-bold leading-4 text-[#F5F1EB]">
              Edição:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
              {['1/10', '1/10', '1/50', 'ABERTA'].map((edLabel, idx) => {
                const isSelected =
                  selectedEditionId === edLabel || (idx === 2 && selectedEditionId === '1/50')
                return (
                  <button
                    key={`${edLabel}-${idx}`}
                    type="button"
                    onClick={() => selectEdition(edLabel)}
                    className={cn(
                      'cursor-pointer rounded-full px-3 py-0.5 font-mono text-[13px] transition-colors',
                      isSelected
                        ? 'border border-[#D28A4C] font-medium text-[#E89B55]'
                        : 'border border-[#3F2319] font-normal text-[#CFB28C] hover:border-[#D28A4C]/50',
                    )}
                  >
                    {edLabel}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Token Info */}
          <div className="flex flex-col gap-1 font-mono text-[13px] leading-4 text-[#B39463]">
            <p>ID do token: #{nft.id.replace('nft-', '').padStart(4, '0')}</p>
            <p>Coleção: {nft.collection}</p>
            <p>Atributos: Óculos, Esmeralda, Raro</p>
          </div>
        </div>

        {/* Buy Bar (Docked at Bottom) */}
        <div className="relative z-20 shrink-0 w-full border-t border-[#3F2319]/50 bg-[#241612] px-6 pt-3 pb-6 shadow-[0px_-4px_20px_rgba(10,6,4,0.45)]">
          <div className="mx-auto flex max-w-[366px] flex-col gap-3">
            {/* Top Row: Quantity + Price */}
            <div className="flex items-center justify-between">
              {/* Quantity */}
              <div className="flex items-center gap-2 font-mono">
                <span className="text-[14px] font-medium text-[#CFB28C]">Qtd.</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isSoldOut}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Diminuir quantidade"
                    className="flex h-[28px] w-[24px] cursor-pointer items-center justify-center rounded-[20px] border border-[#140D0A] bg-[#D28A4C] text-black shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="size-3.5 text-black" strokeWidth={3} />
                  </button>
                  <span className="min-w-4 text-center font-mono text-[16px] font-medium text-[#F5F1EB]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= maxQuantity || isSoldOut}
                    onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                    aria-label="Aumentar quantidade"
                    className="flex h-[28px] w-[24px] cursor-pointer items-center justify-center rounded-[20px] border border-[#140D0A] bg-[#D28A4C] text-black shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="size-3.5 text-black" strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="font-mono text-[18px] font-bold text-[#E89B55]">
                {formatEth(Big(nft.priceEth).times(quantity).toString())} ETH
              </div>
            </div>

            {/* Bottom Row: Buy Button + Cart Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSoldOut}
                onClick={() => {
                  addToCart.mutate(
                    {
                      nftId: nft.id,
                      quantity,
                      editionId: edition?.id ?? selectedEditionId,
                    },
                    {
                      onSuccess: () => {
                        navigate({ to: '/carrinho' })
                      },
                    },
                  )
                }}
                className="flex h-[52px] flex-1 cursor-pointer items-center justify-center rounded-[40px] font-mono text-[16px] font-bold text-[#140D0A] shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background:
                    'linear-gradient(93.21deg, #D28A4C -3.96%, rgba(210, 138, 76, 0.8) 121.97%)',
                }}
              >
                {isSoldOut ? 'Esgotado' : 'Comprar NFT'}
              </button>

              <button
                type="button"
                disabled={isSoldOut}
                onClick={() => {
                  addToCart.mutate({
                    nftId: nft.id,
                    quantity,
                    editionId: edition?.id ?? selectedEditionId,
                  })
                }}
                aria-label="Adicionar ao carrinho"
                className="flex size-[52px] shrink-0 cursor-pointer items-center justify-center rounded-[40px] border border-[#3F2319] bg-[#2F1D15] text-[#B39463] shadow-md transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop / Detalhes do NFT */}
      <div className="mx-auto hidden w-full max-w-[1440px] flex-col gap-[96px] px-4 py-6 sm:px-6 md:flex lg:px-[120px]">
        {/* Top Section (Breadcrumb + Product Images & Details) */}
        <section aria-label="Detalhes principais do produto" className="flex w-full flex-col gap-8">
          {/* Breadcrumb: Início / Mercado */}
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
          </nav>

          {/* Product: Left (Images) + Right (Details) */}
          <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
            {/* Product Images: Thumbnails (100px) + Main Image (444px) = 573px */}
            <div className="flex w-full flex-col-reverse gap-4 sm:flex-row sm:items-center sm:gap-7 lg:w-[573px] lg:shrink-0">
              {/* Thumbnails (100px wide, gap 16px) */}
              <div className="flex gap-4 sm:flex-col sm:gap-4">
                {thumbnails.map((imgSrc, idx) => {
                  const active = selectedThumbnailIdx === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedThumbnailIdx(idx)}
                      aria-label={`Visualizar miniatura ${idx + 1}`}
                      className={cn(
                        'size-[100px] shrink-0 cursor-pointer overflow-hidden rounded-[8px] bg-[#241612] transition-all',
                        active
                          ? 'border border-primary'
                          : 'border border-transparent hover:border-primary/50',
                      )}
                    >
                      <img src={imgSrc} alt="" className="size-full rounded-[8px] object-cover" />
                    </button>
                  )
                })}
              </div>

              {/* Main Image Box: 444px x 444px, bg #241612, inner image 404px x 404px rounded-[24px] */}
              <div className="relative flex size-full max-w-[444px] items-center justify-center rounded-[6px] bg-[#241612] p-4 sm:size-[444px]">
                <img
                  src={mainArtworkUrl}
                  alt={`Arte digital de ${nft.name}`}
                  className="size-[404px] max-h-full max-w-full rounded-[24px] object-cover"
                />
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  aria-label="Ampliar imagem da arte"
                  title="Ampliar arte"
                  className="absolute top-[15px] right-[15px] flex size-[30px] cursor-pointer items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-[#F5F1EB] transition-colors hover:border-primary hover:text-highlight"
                >
                  <Search aria-hidden="true" className="size-5" />
                </button>
              </div>
            </div>

            {/* Details Column: 595px x 448px, justify-between */}
            <div className="flex flex-1 flex-col justify-between gap-5 lg:min-h-[448px] lg:w-[595px]">
              {/* Title & Price / Star Rating */}
              <div className="flex flex-col gap-3">
                <h1 className="font-mono text-[28px] leading-[37px] font-bold text-[#F5F1EB]">
                  {nft.name}
                </h1>

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="font-mono text-[22px] leading-4 font-bold text-[#E89B55]">
                    {formatEth(nft.priceEth)} ETH
                  </span>

                  <div className="flex items-center gap-1.5 font-mono text-[15px] leading-5 text-[#F5F1EB]">
                    <div
                      role="img"
                      className="flex items-center gap-1"
                      aria-label="Avaliação 4 de 5 estrelas"
                    >
                      <Star className="size-[15px] fill-primary text-primary" />
                      <Star className="size-[15px] fill-primary text-primary" />
                      <Star className="size-[15px] fill-primary text-primary" />
                      <Star className="size-[15px] fill-primary text-primary" />
                      <Star className="size-[15px] fill-text-secondary text-text-secondary" />
                    </div>
                    <span>19 avaliações de colecionadores</span>
                  </div>
                </div>

                {/* Thin hairline divider: border 0.3px solid #D28A4C */}
                <div className="w-full border-b border-[#D28A4C]/30 pt-1" />
              </div>

              {/* Sobre este NFT: */}
              <div className="flex flex-col gap-3">
                <h2 className="font-mono text-[15px] leading-4 font-bold text-[#F5F1EB]">
                  Sobre este NFT:
                </h2>
                <p className="font-mono text-[14px] leading-6 font-normal text-[#CFB28C]">
                  Um colecionável digital finalizado à mão da coleção {nft.collection}, verificado
                  na {nft.network}, com arte desbloqueável e acesso para colecionadores.
                </p>
              </div>

              {/* Edição: */}
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[15px] leading-4 font-bold text-[#F5F1EB]">
                  Edição:
                </span>
                <div className="flex flex-wrap items-center gap-[6px]">
                  {editionPills.map((pill) => {
                    const active = selectedEditionId === pill.id
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => selectEdition(pill.id)}
                        className={cn(
                          'flex h-[28px] cursor-pointer items-center justify-center rounded-full px-2 font-mono text-[14px] leading-4 transition-colors',
                          pill.widthClass,
                          active
                            ? 'border border-primary font-medium text-[#E89B55]'
                            : 'border border-[#3F2319] font-normal text-[#CFB28C] hover:border-primary/50',
                        )}
                      >
                        {pill.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Stepper + CTA Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                {/* Stepper: Minus (33x49.5 pill) + Quantity + Plus (33x49.5 pill) */}
                <div className="flex h-[49.5px] items-center gap-3">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="flex h-[49.5px] w-[33px] cursor-pointer items-center justify-center rounded-[33px] border border-[#140D0A] bg-primary text-[#000000] shadow-[0px_6.6px_19.8px_-3.3px_rgba(20,13,10,0.15)] transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus aria-hidden="true" className="size-4 stroke-[2.5]" />
                  </button>
                  <span className="min-w-[13px] text-center font-mono text-[20px] leading-7 font-normal text-[#F5F1EB]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    disabled={quantity >= maxQuantity}
                    onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
                    className="flex h-[49.5px] w-[33px] cursor-pointer items-center justify-center rounded-[33px] border border-[#140D0A] bg-primary text-[#000000] shadow-[0px_6.6px_19.8px_-3.3px_rgba(20,13,10,0.15)] transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus aria-hidden="true" className="size-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Action Buttons: COMPRAR (130x40) + Favoritar/Desfavoritar (130x40) */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSoldOut || !edition}
                    onClick={() => {
                      if (!edition) return
                      addToCart.mutate(
                        { nftId: nft.id, editionId: edition.id, quantity },
                        { onSuccess: () => navigate({ to: '/carrinho' }) },
                      )
                    }}
                    className="flex h-[40px] w-[130px] cursor-pointer items-center justify-center rounded-[6px] bg-primary font-mono text-[14px] leading-5 font-bold text-[#140D0A] transition-colors hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    COMPRAR
                  </button>

                  <button
                    type="button"
                    aria-pressed={isFavorite}
                    aria-label={
                      isFavorite ? `Remover ${nft.name} dos favoritos` : `Favoritar ${nft.name}`
                    }
                    onClick={handleToggleFavorite}
                    className={cn(
                      'flex h-[40px] w-[130px] cursor-pointer items-center justify-center gap-2 rounded-[6px] border border-primary font-mono text-[14px] leading-5 font-medium transition-colors',
                      isFavorite
                        ? 'bg-primary/15 text-highlight'
                        : 'text-highlight hover:bg-primary/10',
                    )}
                  >
                    <Heart
                      aria-hidden="true"
                      className={cn(
                        'size-5 transition-transform active:scale-125',
                        isFavorite ? 'fill-primary text-primary' : 'text-primary',
                      )}
                    />
                    <span>{isFavorite ? 'Desfavoritar' : 'Favoritar'}</span>
                  </button>
                </div>
              </div>

              {/* Token Metadata & Social Share */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex flex-col gap-3 font-mono text-[15px] leading-5 text-[#B39463]">
                  <p>ID do token: #{nft.id === 'nft-1' ? '0042' : nft.id.replace('nft-', '004')}</p>
                  <p>Coleção: {nft.collection}</p>
                  <p>Atributos: Óculos, Esmeralda, Raro</p>
                </div>

                <div className="flex items-center gap-2 pt-1 font-mono text-[15px] text-[#F5F1EB]">
                  <span className="font-bold">Compartilhar este NFT:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleShare('linkedin')}
                      aria-label="Compartilhar no LinkedIn"
                      className="p-1 text-[#F5F1EB] transition-colors hover:text-primary"
                    >
                      <Linkedin aria-hidden="true" className="size-[15px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare('email')}
                      aria-label="Compartilhar por E-mail"
                      className="p-1 text-[#F5F1EB] transition-colors hover:text-primary"
                    >
                      <Mail aria-hidden="true" className="size-[18px]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare('twitter')}
                      aria-label="Compartilhar no Twitter"
                      className="p-1 text-[#F5F1EB] transition-colors hover:text-primary"
                    >
                      <Twitter aria-hidden="true" className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          navigator.clipboard?.writeText(window.location.href)
                          setCopiedLink(true)
                          setTimeout(() => setCopiedLink(false), 2000)
                        }
                      }}
                      aria-label="Copiar link"
                      title={copiedLink ? 'Link copiado!' : 'Copiar link'}
                      className="p-1 text-[#F5F1EB] transition-colors hover:text-primary"
                    >
                      {copiedLink ? (
                        <Check aria-hidden="true" className="size-4 text-emerald-400" />
                      ) : (
                        <Copy aria-hidden="true" className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Description Section with Tabs (Detalhes do NFT / Avaliações) */}
        <section aria-labelledby="details-heading" className="flex w-full flex-col gap-6">
          <h2 id="details-heading" className="sr-only">
            Detalhes e avaliações do NFT
          </h2>

          {/* Tabs Bar */}
          <div className="flex flex-col">
            <div className="flex items-center gap-8 font-mono text-[17px] leading-4">
              <button
                type="button"
                onClick={() => setActiveTab('detalhes')}
                className={cn(
                  'border-b-[3px] pb-3 transition-colors',
                  activeTab === 'detalhes'
                    ? 'border-primary font-bold text-[#E89B55]'
                    : 'border-transparent font-normal text-[#F5F1EB] hover:text-[#E89B55]',
                )}
              >
                Detalhes do NFT
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('avaliacoes')}
                className={cn(
                  'border-b-[3px] pb-3 transition-colors',
                  activeTab === 'avaliacoes'
                    ? 'border-primary font-bold text-[#E89B55]'
                    : 'border-transparent font-normal text-[#F5F1EB] hover:text-[#E89B55]',
                )}
              >
                Avaliações de colecionadores (19)
              </button>
            </div>
            <div className="w-full border-b border-[#D28A4C]/30" />
          </div>

          {/* Tab Content */}
          {activeTab === 'detalhes' ? (
            <div className="flex flex-col gap-6 font-mono text-[14px] leading-6 text-[#CFB28C]">
              <p>
                {nft.name} é uma obra digital 1/50 finalizada à mão da coleção {nft.collection}.
                Cada atributo fica armazenado nos metadados do token e verificado na {nft.network}.
                A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.
              </p>

              <p>
                A propriedade inclui a arte em alta resolução, lançamentos exclusivos para
                colecionadores e um registro permanente de procedência registrada na rede. Nova Sato
                recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e
                lançamentos da comunidade.
              </p>

              <div className="flex flex-col gap-3 font-mono text-[14px] leading-6">
                <div>
                  <p className="font-bold text-[#F5F1EB]">Rede:</p>
                  <p className="text-[#CFB28C]">
                    Cunhado na {nft.network} com procedência imutável e metadados armazenados no
                    IPFS.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-[#F5F1EB]">Contrato:</p>
                  <p className="text-[#CFB28C]">
                    0x7A42...19E8 • Contrato inteligente ERC-721 verificado.
                  </p>
                </div>

                <div>
                  <p className="font-bold text-[#F5F1EB]">Direitos autorais:</p>
                  <p className="text-[#CFB28C]">
                    Direitos autorais do criador: 5% nas vendas secundárias, pagos automaticamente
                    pelos mercados compatíveis.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 font-mono">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-[20px] font-bold text-[#E89B55]">4.8 / 5.0</span>
                <div className="flex items-center gap-1" aria-hidden="true">
                  <Star className="size-4 fill-primary text-primary" />
                  <Star className="size-4 fill-primary text-primary" />
                  <Star className="size-4 fill-primary text-primary" />
                  <Star className="size-4 fill-primary text-primary" />
                  <Star className="size-4 fill-text-secondary text-text-secondary" />
                </div>
                <span className="text-sm text-text-secondary">Baseado em 19 avaliações</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {MOCK_REVIEWS.map((review, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 rounded-[8px] border border-[#3F2319] bg-[#241612] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] font-bold text-[#F5F1EB]">{review.author}</span>
                      <span className="text-xs text-[#CFB28C]">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1" aria-hidden="true">
                      {Array.from({ length: review.stars }).map((_, starIdx) => (
                        <Star key={starIdx} className="size-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-[14px] leading-6 text-[#CFB28C]">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Related Products: "Mais desta coleção" */}
        <section aria-labelledby="related-heading" className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2
              id="related-heading"
              className="font-mono text-[17px] leading-4 font-bold text-[#E89B55]"
            >
              Mais desta coleção
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
                className="group flex flex-col gap-3 lg:w-[219px]"
              >
                <div className="flex h-[255px] w-full items-center justify-center rounded-[13px] bg-[#241612] p-3 transition-transform group-hover:scale-[1.02]">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="size-[212px] max-h-full max-w-full rounded-[13px] object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 font-mono">
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
              className="flex size-6 cursor-pointer items-center justify-center p-1"
            >
              <span
                className={cn(
                  'size-[12px] rounded-full transition-colors',
                  activeDot === 0 ? 'bg-primary' : 'border-[1.3px] border-primary',
                )}
              />
            </button>
            <button
              type="button"
              onClick={() => setActiveDot(1)}
              aria-label="Página atual"
              className="flex size-6 cursor-pointer items-center justify-center p-1"
            >
              <span
                className={cn(
                  'size-[12px] rounded-full transition-colors',
                  activeDot === 1 ? 'bg-primary' : 'border-[1.3px] border-primary',
                )}
              />
            </button>
            <button
              type="button"
              onClick={() => setActiveDot(2)}
              aria-label="Próxima página"
              className="flex size-6 cursor-pointer items-center justify-center p-1"
            >
              <span
                className={cn(
                  'size-[12px] rounded-full transition-colors',
                  activeDot === 2 ? 'bg-primary' : 'border-[1.3px] border-primary',
                )}
              />
            </button>
          </div>
        </section>
      </div>

      {/* Lightbox / Zoom Dialog Modal */}
      {isZoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="zoom-artwork-title"
          className="fixed inset-0 z-50 flex items-center justify-center overscroll-contain bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative flex max-h-[90vh] max-w-[90vw] flex-col items-center rounded-2xl border border-[#3F2319] bg-[#241612] p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex w-full items-center justify-between">
              <h2 id="zoom-artwork-title" className="font-mono text-lg font-bold text-[#F5F1EB]">
                {nft.name} • {nft.collection}
              </h2>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                aria-label="Fechar visualização ampliada"
                className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-[#3F2319] bg-[#2F1D15] text-[#F5F1EB] transition-colors hover:border-primary hover:text-highlight"
              >
                <X className="size-4" />
              </button>
            </div>
            <img
              src={mainArtworkUrl}
              alt={nft.name}
              className="max-h-[75vh] max-w-[80vw] rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  )
}
