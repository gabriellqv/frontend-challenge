import type { Nft } from '@/shared/contracts'

import { NftCard } from './NftCard'

/** Props de {@link NftGrid}. */
interface NftGridProps {
  /** NFTs da página atual. */
  nfts: Nft[]
  /** Ids marcados como favoritos pelo usuário. */
  favoriteIds: Set<string>
  /** Alterna o favorito de um NFT. */
  onToggleFavorite: (nftId: string, favorite: boolean) => void
}

/**
 * Grade responsiva do catálogo: uma coluna no mobile, duas em `sm` e três em
 * `lg`, mantendo o mesmo ritmo vertical do {@link NftGrid} de skeletons.
 *
 * @param props - {@link NftGridProps}
 * @returns Lista de cards de NFT.
 * @example
 * <NftGrid nfts={page.items} favoriteIds={favoriteIds} onToggleFavorite={toggle} />
 */
export function NftGrid({ nfts, favoriteIds, onToggleFavorite }: NftGridProps) {
  return (
    <ul className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-6 lg:w-[842px] lg:grid-cols-3 lg:gap-x-[34px] lg:gap-y-[72px]">
      {nfts.map((nft) => (
        <li key={nft.id} className="flex justify-center">
          <NftCard
            nft={nft}
            isFavorite={favoriteIds.has(nft.id)}
            onToggleFavorite={onToggleFavorite}
          />
        </li>
      ))}
    </ul>
  )
}
