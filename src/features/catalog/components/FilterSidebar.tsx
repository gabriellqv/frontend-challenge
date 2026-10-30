import { useId } from 'react'
import type { FormEvent } from 'react'

import type { Network } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const optionClass = cn(
  'flex cursor-pointer items-center gap-2 rounded-[5px] px-2 py-1.5 text-sm text-canvas transition-colors hover:bg-surface-raised',
  'has-[:checked]:bg-surface-raised has-[:checked]:text-primary',
  'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary',
)

const radioClass = 'size-4 shrink-0 accent-primary'

const priceInputClass = cn(
  'h-9 w-full rounded-[5px] border border-surface-dark bg-ink/40 px-2.5 text-sm text-canvas placeholder:text-text-secondary/70',
  focusRing,
)

const applyButtonClass = cn(
  'inline-flex h-9 items-center justify-center rounded-[5px] bg-primary px-3 text-sm font-bold text-ink transition-colors hover:bg-highlight',
  focusRing,
)

const sectionTitleClass = 'mb-1 text-xs font-bold tracking-wide text-text-secondary uppercase'

/**
 * Valores dos filtros do catálogo.
 *
 * `undefined` é explícito porque o projeto usa `exactOptionalPropertyTypes`:
 * limpar um filtro precisa remover o valor, não apenas omitir a chave.
 */
export interface FilterValues {
  /** Coleção selecionada; ausente significa "Todas". */
  collection?: string | undefined
  /** Rede selecionada; ausente significa "Todas". */
  network?: Network | undefined
  /** Preço mínimo em ETH como string decimal. */
  priceMin?: string | undefined
  /** Preço máximo em ETH como string decimal. */
  priceMax?: string | undefined
}

/** Props de {@link FilterSidebar}. */
interface FilterSidebarProps {
  /** Coleções disponíveis para filtro. */
  collections: readonly string[]
  /** Redes disponíveis para filtro. */
  networks: readonly Network[]
  /** Filtros ativos. */
  value: FilterValues
  /** Aplica um subconjunto de filtros; a página deve voltar para 1. */
  onChange: (patch: Partial<FilterValues>) => void
}

/** Lê um input de texto do formulário sem confiar no tipo retornado por `FormData`. */
function readTextInput(form: HTMLFormElement, name: string): string {
  const field = form.elements.namedItem(name)
  return field instanceof HTMLInputElement ? field.value.trim() : ''
}

/**
 * Barra lateral de filtros do catálogo: coleção, rede e faixa de preço.
 * No mobile empilha acima da grade; a partir de `lg` vira coluna fixa de 270px.
 *
 * @param props - {@link FilterSidebarProps}
 * @returns Coluna de filtros acessível.
 * @example
 * <FilterSidebar
 *   collections={collections}
 *   networks={NETWORKS}
 *   value={filters}
 *   onChange={patchFilters}
 * />
 */
export function FilterSidebar({ collections, networks, value, onChange }: FilterSidebarProps) {
  const priceMinId = useId()
  const priceMaxId = useId()

  function applyPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const min = readTextInput(event.currentTarget, 'priceMin')
    const max = readTextInput(event.currentTarget, 'priceMax')

    onChange({
      priceMin: min === '' ? undefined : min,
      priceMax: max === '' ? undefined : max,
    })
  }

  return (
    <aside aria-labelledby="catalog-filters-title" className="w-full lg:w-[270px] lg:shrink-0">
      <div className="flex flex-col gap-5 rounded-[16px] border border-surface-dark bg-surface-card p-4 text-canvas lg:sticky lg:top-4">
        <h2 id="catalog-filters-title" className="text-base font-bold">
          Filtros
        </h2>

        <div
          role="radiogroup"
          aria-labelledby="filter-collection-title"
          className="flex flex-col gap-0.5"
        >
          <h3 id="filter-collection-title" className={sectionTitleClass}>
            Coleção
          </h3>

          <label className={optionClass}>
            <input
              type="radio"
              name="collection"
              value=""
              checked={value.collection === undefined}
              onChange={() => onChange({ collection: undefined })}
              className={radioClass}
            />
            <span>Todas</span>
          </label>

          {collections.map((collection) => (
            <label key={collection} className={optionClass}>
              <input
                type="radio"
                name="collection"
                value={collection}
                checked={value.collection === collection}
                onChange={() => onChange({ collection })}
                className={radioClass}
              />
              <span>{collection}</span>
            </label>
          ))}
        </div>

        <div
          role="radiogroup"
          aria-labelledby="filter-network-title"
          className="flex flex-col gap-0.5"
        >
          <h3 id="filter-network-title" className={sectionTitleClass}>
            Rede
          </h3>

          <label className={optionClass}>
            <input
              type="radio"
              name="network"
              value=""
              checked={value.network === undefined}
              onChange={() => onChange({ network: undefined })}
              className={radioClass}
            />
            <span>Todas</span>
          </label>

          {networks.map((network) => (
            <label key={network} className={optionClass}>
              <input
                type="radio"
                name="network"
                value={network}
                checked={value.network === network}
                onChange={() => onChange({ network })}
                className={radioClass}
              />
              <span>{network}</span>
            </label>
          ))}
        </div>

        <div role="group" aria-labelledby="filter-price-title" className="flex flex-col gap-2">
          <h3 id="filter-price-title" className={sectionTitleClass}>
            Faixa de preço
          </h3>

          {/* `key` remonta os inputs quando a URL muda, mantendo o formulário não controlado. */}
          <form
            key={`${value.priceMin ?? ''}:${value.priceMax ?? ''}`}
            onSubmit={applyPrice}
            className="flex flex-col gap-2"
          >
            <div className="flex items-start gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label htmlFor={priceMinId} className="text-xs text-text-secondary">
                  Mínimo (ETH)
                </label>
                <input
                  id={priceMinId}
                  name="priceMin"
                  type="text"
                  inputMode="decimal"
                  pattern="\d+(\.\d+)?"
                  title="Informe um valor em ETH, como 1.25"
                  defaultValue={value.priceMin ?? ''}
                  placeholder="0.00"
                  className={priceInputClass}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <label htmlFor={priceMaxId} className="text-xs text-text-secondary">
                  Máximo (ETH)
                </label>
                <input
                  id={priceMaxId}
                  name="priceMax"
                  type="text"
                  inputMode="decimal"
                  pattern="\d+(\.\d+)?"
                  title="Informe um valor em ETH, como 5.00"
                  defaultValue={value.priceMax ?? ''}
                  placeholder="0.00"
                  className={priceInputClass}
                />
              </div>
            </div>

            <button type="submit" className={applyButtonClass}>
              Aplicar
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
