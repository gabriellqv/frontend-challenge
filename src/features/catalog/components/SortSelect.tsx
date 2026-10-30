import { useId } from 'react'

import { ChevronDown } from 'lucide-react'

import type { NftSort } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
] as const satisfies ReadonlyArray<{ value: NftSort; label: string }>

/** Props de {@link SortSelect}. */
interface SortSelectProps {
  /** Ordenação atual; ausente equivale a "Mais recentes". */
  value?: NftSort | undefined
  /** Notifica a nova ordenação escolhida. */
  onChange: (sort: NftSort) => void
}

/**
 * Seletor de ordenação do catálogo, com rótulo visível e associação via `id`.
 *
 * @param props - {@link SortSelectProps}
 * @returns Select nativo estilizado.
 * @example
 * <SortSelect value={sort} onChange={(nextSort) => setSort(nextSort)} />
 */
export function SortSelect({ value, onChange }: SortSelectProps) {
  const selectId = useId()

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
      <label htmlFor={selectId} className="text-sm text-text-secondary">
        Ordenar por
      </label>

      <div className="relative">
        <select
          id={selectId}
          value={value ?? 'newest'}
          onChange={(event) => {
            const option = SORT_OPTIONS.find((item) => item.value === event.target.value)
            if (option) onChange(option.value)
          }}
          className={cn(
            'h-9 w-full appearance-none rounded-[5px] border border-surface-dark bg-surface-card pr-9 pl-3 text-sm text-canvas',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          )}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-surface-card text-canvas">
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-text-secondary"
        />
      </div>
    </div>
  )
}
