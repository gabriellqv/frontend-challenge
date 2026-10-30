import { Link } from '@tanstack/react-router'

import { Heart } from 'lucide-react'

import type { Nft } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'
import { formatEth } from '@/shared/lib/money'

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/** Props de {@link NftCard}. */
interface NftCardProps {
  /** NFT exibido no card. */
  nft: Nft
  /** Se o NFT está nos favoritos do usuário. */
  isFavorite: boolean
  /** Alterna o favorito; recebe o id e o novo estado desejado. */
  onToggleFavorite: (nftId: string, favorite: boolean) => void
}

/**
 * Card do catálogo com arte, nome, coleção, preço e ação de favorito.
 *
 * O card inteiro é um link para o detalhe. O botão de favorito fica fora do
 * link para que o clique não dispare a navegação.
 *
 * @param props - {@link NftCardProps}
 * @returns Card de NFT.
 * @example
 * <NftCard nft={nft} isFavorite={favoriteIds.has(nft.id)} onToggleFavorite={toggle} />
 */
export function NftCard({ nft, isFavorite, onToggleFavorite }: NftCardProps) {
  const favoriteLabel = isFavorite
    ? `Remover ${nft.name} dos favoritos`
    : `Adicionar ${nft.name} aos favoritos`

  return (
    <article className="relative h-full w-full lg:max-w-[258px]">
      <button
        type="button"
        aria-pressed={isFavorite}
        aria-label={favoriteLabel}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onToggleFavorite(nft.id, !isFavorite)
        }}
        className={cn(
          'absolute top-5 right-5 z-10 inline-flex size-9 items-center justify-center rounded-[5px] bg-ink/70 text-canvas transition-colors hover:bg-ink hover:text-primary',
          focusRing,
        )}
      >
        <Heart
          aria-hidden="true"
          className={cn('size-5', isFavorite ? 'fill-primary text-primary' : 'fill-transparent')}
        />
      </button>

      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        className={cn(
          'flex h-full flex-col gap-3 rounded-[16px] border border-surface-dark bg-surface-card p-3 text-canvas shadow-card transition-colors hover:border-primary/60',
          focusRing,
        )}
      >
        <img
          src={nft.imageUrl}
          alt={`Arte do NFT ${nft.name}`}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full rounded-xl object-cover"
        />

        <div className="flex flex-1 flex-col gap-1 px-1">
          <h3 className="text-base leading-tight font-bold">{nft.name}</h3>
          <p className="text-sm text-text-secondary">{nft.collection}</p>

          <p className="mt-auto flex flex-wrap items-baseline gap-x-1 pt-2">
            <span className="text-xs text-text-secondary">Preço</span>
            <span className="text-lg leading-none font-bold text-primary">
              {formatEth(nft.priceEth)} ETH
            </span>
          </p>
        </div>
      </Link>
    </article>
  )
}
