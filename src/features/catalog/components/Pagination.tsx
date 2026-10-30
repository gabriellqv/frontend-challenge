import type { Pagination as PaginationState } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'

type PageToken = number | 'ellipsis-start' | 'ellipsis-end'

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const navButtonClass = cn(
  'inline-flex h-9 items-center justify-center rounded-[5px] border border-surface-dark px-3 text-sm text-canvas transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40',
  focusRing,
)

const pageButtonClass = cn(
  'inline-flex size-9 items-center justify-center rounded-[5px] border border-surface-dark text-sm text-canvas transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40',
  focusRing,
)

/**
 * Gera os tokens de página exibidos: no máximo sete posições, com reticências
 * quando a janela não alcança as extremidades.
 */
function getPageTokens(page: number, totalPages: number): PageToken[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages]
  }

  if (page >= totalPages - 3) {
    return [
      1,
      'ellipsis-start',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [1, 'ellipsis-start', page - 1, page, page + 1, 'ellipsis-end', totalPages]
}

/** Props de {@link Pagination}. */
interface PaginationProps {
  /** Estado de paginação retornado pela API. */
  pagination: PaginationState
  /** Solicita outra página. */
  onChange: (page: number) => void
}

/**
 * Controles de paginação do catálogo. Mostra no máximo sete posições, desabilita
 * os botões nas bordas e marca a página atual com `aria-current`.
 *
 * @param props - {@link PaginationProps}
 * @returns Navegação de páginas, ou `null` quando não há páginas.
 * @example
 * <Pagination pagination={page.pagination} onChange={(page) => updatePage(page)} />
 */
export function Pagination({ pagination, onChange }: PaginationProps) {
  const { page, totalPages } = pagination

  if (totalPages < 1) return null

  const tokens = getPageTokens(page, totalPages)

  return (
    <nav
      aria-label="Paginação do catálogo"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={navButtonClass}
      >
        Anterior
      </button>

      <ol className="flex flex-wrap items-center gap-1">
        {tokens.map((token) =>
          typeof token === 'number' ? (
            <li key={token}>
              <button
                type="button"
                onClick={() => onChange(token)}
                aria-current={token === page ? 'page' : undefined}
                aria-label={`Página ${token}`}
                className={cn(
                  pageButtonClass,
                  token === page && 'border-primary bg-primary font-bold text-ink hover:bg-primary',
                )}
              >
                {token}
              </button>
            </li>
          ) : (
            <li key={token} aria-hidden="true" className="px-1 text-sm text-text-secondary">
              …
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className={navButtonClass}
      >
        Próxima
      </button>

      <span className="sr-only" aria-live="polite">
        Página {page} de {totalPages}
      </span>
    </nav>
  )
}
