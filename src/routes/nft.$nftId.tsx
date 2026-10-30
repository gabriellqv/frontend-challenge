import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { Heart } from 'lucide-react'

import { nftQueryOptions } from '@/features/catalog/api'
import { favoritesQueryOptions, useToggleFavorite } from '@/features/favorites/api'
import { NftDetailSkeleton } from '@/shared/components/skeletons/NftDetailSkeleton'
import { DEFAULT_NFT_LIST_QUERY } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'
import { formatEth, mul } from '@/shared/lib/money'

export const Route = createFileRoute('/nft/$nftId')({
  component: NftDetailPage,
})

function NftDetailPage() {
  const { nftId } = Route.useParams()
  const nftQuery = useQuery(nftQueryOptions(nftId))
  const favorites = useQuery(favoritesQueryOptions())
  const toggleFavorite = useToggleFavorite()

  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

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
        <h1 className="font-mono text-2xl font-bold text-ink">NFT não encontrado</h1>
        <p className="mt-2 text-sm text-text-secondary">
          O NFT que você procura não existe ou foi removido.
        </p>
        <Link
          to="/"
          search={DEFAULT_NFT_LIST_QUERY}
          className="mt-6 inline-flex rounded-[5px] bg-primary px-4 py-2 text-sm font-bold text-ink"
        >
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  const nft = nftQuery.data
  const edition = nft.editions.find((item) => item.id === selectedEditionId) ?? nft.editions[0]
  const available = edition?.available ?? 0
  const isSoldOut = available === 0
  const maxQuantity = Math.max(1, available)
  const subtotalEth = formatEth(mul(nft.priceEth, String(quantity)))
  const isFavorite = favorites.data?.items.some((item) => item.nftId === nft.id) ?? false

  function selectEdition(editionId: string) {
    setSelectedEditionId(editionId)
    setQuantity(1)
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <img
            src={nft.imageUrl}
            alt={`Arte do NFT ${nft.name}`}
            className="aspect-square w-full rounded-[16px] border border-surface-dark object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-sm text-text-secondary">
            {nft.collection} · {nft.network}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="font-mono text-3xl font-bold text-ink">{nft.name}</h1>
            <button
              type="button"
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? `Remover ${nft.name} dos favoritos`
                  : `Adicionar ${nft.name} aos favoritos`
              }
              onClick={() => toggleFavorite.mutate({ nftId: nft.id, favorite: !isFavorite })}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-[8px] border border-surface-dark bg-surface-card text-canvas transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Heart
                aria-hidden="true"
                className={cn(
                  'size-5',
                  isFavorite ? 'fill-primary text-primary' : 'fill-transparent',
                )}
              />
            </button>
          </div>
          <p className="mt-1 text-sm text-text-secondary">por {nft.creator.name}</p>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">{nft.description}</p>

          {nft.editions.length > 0 && (
            <fieldset className="mt-6">
              <legend className="text-xs font-bold tracking-wide text-text-secondary uppercase">
                Edição
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {nft.editions.map((item) => {
                  const active = item.id === edition?.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={active}
                      disabled={item.available === 0}
                      onClick={() => selectEdition(item.id)}
                      className={cn(
                        'rounded-[6px] border px-3 py-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                        active
                          ? 'border-primary bg-primary text-ink'
                          : 'border-surface-dark bg-surface-card text-canvas hover:border-primary/60',
                      )}
                    >
                      {item.name}
                      <span className="ml-1 text-xs opacity-70">({item.available})</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )}

          <div className="mt-6 rounded-[16px] border border-surface-dark bg-surface-card p-4 text-canvas">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-text-secondary">Preço</p>
                <p className="text-2xl font-bold text-primary">{formatEth(nft.priceEth)} ETH</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-xs text-text-secondary">Qtd.</span>
                <input
                  type="number"
                  min={1}
                  max={maxQuantity}
                  value={quantity}
                  disabled={isSoldOut}
                  onChange={(event) => {
                    const next = Number(event.target.value)
                    setQuantity(Math.min(Math.max(1, next || 1), maxQuantity))
                  }}
                  className="w-16 rounded-[6px] border border-surface-dark bg-ink px-2 py-1 text-center text-sm text-canvas"
                  aria-label="Quantidade"
                />
              </label>
            </div>

            <p className="mt-1 text-xs text-text-secondary">
              {isSoldOut ? 'Esgotado' : `${available} disponíveis · subtotal ${subtotalEth} ETH`}
            </p>

            <Link
              to="/carrinho"
              aria-disabled={isSoldOut}
              onClick={(event) => {
                if (isSoldOut) event.preventDefault()
              }}
              className={cn(
                'mt-4 inline-flex w-full justify-center rounded-[5px] bg-primary px-4 py-2.5 text-sm font-bold text-ink',
                isSoldOut && 'pointer-events-none opacity-50',
              )}
            >
              Comprar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
