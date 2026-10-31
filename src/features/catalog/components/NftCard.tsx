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
    <article className="relative flex w-full flex-col gap-3 lg:w-[258px]">
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
          'group/fav absolute top-3 right-3 z-10 inline-flex size-9 cursor-pointer items-center justify-center rounded-[5px] bg-ink shadow-sm',
          focusRing,
        )}
      >
        <Heart
          aria-hidden="true"
          className={cn(
            'size-5 transition-colors duration-150',
            isFavorite
              ? 'fill-primary text-primary'
              : 'fill-transparent text-canvas group-hover/fav:text-primary',
          )}
        />
      </button>

      <Link
        to="/nft/$nftId"
        params={{ nftId: nft.id }}
        className={cn('group flex flex-col gap-3 text-canvas cursor-pointer', focusRing)}
      >
        {/* Rectangle 6: 258px x 300px, background: #241612 */}
        <div className="flex h-[300px] w-full items-center justify-center bg-card lg:w-[258px]">
          <img
            src={nft.imageUrl}
            alt={`Arte do NFT ${nft.name}`}
            loading="lazy"
            decoding="async"
            className="size-[250px] rounded-[15px] object-cover"
          />
        </div>

        {/* Title & Price */}
        <div className="flex flex-col gap-1 w-full">
          <h3 className="truncate font-mono text-[16px] leading-4 font-normal text-foreground transition-colors group-hover:text-highlight">
            {nft.name}
          </h3>
          <p className="font-mono text-[18px] leading-4 font-bold text-highlight">
            {formatEth(nft.priceEth)} ETH
          </p>
        </div>
      </Link>
    </article>
  )
}
