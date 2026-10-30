import { Link } from '@tanstack/react-router'

import { cn } from '@/shared/lib/cn'

/** Destinos institucionais ainda inexistentes: listados como "em breve". */
const COMING_SOON_LINKS = [
  'Criadores',
  'Aprenda',
  'Central de ajuda',
  'Política do mercado',
] as const

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

/**
 * Rodapé global do Kurio com links institucionais e direitos autorais.
 *
 * @returns Elemento `footer` da aplicação.
 * @example
 * <Footer />
 */
export function Footer() {
  return (
    <footer className="border-t border-surface-dark bg-ink text-canvas">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between xl:px-0">
        <Link
          to="/"
          className={cn(
            'self-start rounded-[3px] font-mono text-sm font-bold tracking-widest text-primary',
            focusRing,
          )}
          aria-label="Kurio, página inicial"
        >
          KURIO
        </Link>

        <nav aria-label="Rodapé">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-xs">
            <li>
              <Link
                to="/"
                className={cn('rounded-[3px] transition-colors hover:text-primary', focusRing)}
              >
                Mercado
              </Link>
            </li>
            {COMING_SOON_LINKS.map((label) => (
              <li key={label}>
                <a
                  href="#"
                  aria-disabled="true"
                  title={`${label} — em breve`}
                  onClick={(event) => event.preventDefault()}
                  className={cn(
                    'cursor-not-allowed rounded-[3px] text-text-secondary/70',
                    focusRing,
                  )}
                >
                  {label}
                  <span className="sr-only"> (em breve)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p className="border-t border-surface-dark px-4 py-4 text-center text-xs text-text-secondary">
        © 2026 Kurio. Propriedade digital para todos.
      </p>
    </footer>
  )
}
