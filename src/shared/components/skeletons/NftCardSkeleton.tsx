import { cn } from '@/shared/lib/cn'

import { Shimmer } from './Shimmer'

/** Props de {@link NftCardSkeleton}. */
interface NftCardSkeletonProps {
  /** Classes extras para o container do card. */
  className?: string
}

/**
 * Placeholder de um card de NFT: arte quadrada, título, coleção e preço.
 *
 * Imagem em `aspect-square` e linhas com altura fixa igual à do texto real,
 * para que a troca pelo card carregado não cause layout shift.
 *
 * @param props - {@link NftCardSkeletonProps}
 * @returns Card decorativo (`aria-hidden`).
 * @example
 * <NftCardSkeleton />
 */
export function NftCardSkeleton({ className }: NftCardSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex w-full flex-col gap-3 rounded-2xl bg-surface-card p-3 shadow-card',
        className,
      )}
    >
      <Shimmer className="aspect-square w-full rounded-xl" />

      <div className="flex flex-col gap-2 px-1">
        <Shimmer className="h-5 w-3/4 rounded-[4px]" />
        <Shimmer className="h-4 w-1/2 rounded-[4px]" />
      </div>

      <div className="flex items-center justify-between gap-3 px-1 pb-1">
        <Shimmer className="h-5 w-24 rounded-[4px]" />
        <Shimmer className="size-9 rounded-[5px]" />
      </div>
    </div>
  )
}
