import { useRef } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { LogIn, Menu, Search, ShoppingCart, X } from 'lucide-react'

import { sessionQueryOptions, useLogout } from '@/features/auth/api'
import { DEFAULT_NFT_LIST_QUERY } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'

/** Seções planejadas, mas fora do escopo do desafio: renderizadas como "em breve". */
const COMING_SOON_SECTIONS = ['Criadores', 'Aprenda'] as const

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

const navLinkClass = cn(
  'inline-flex items-center border-b-2 border-transparent py-3 text-sm text-canvas transition-colors hover:text-primary',
  'data-[status=active]:border-primary data-[status=active]:font-bold data-[status=active]:text-primary',
  focusRing,
)

const comingSoonLinkClass = cn(
  'inline-flex cursor-not-allowed items-center py-3 text-sm text-text-secondary/70',
  focusRing,
)

const iconButtonClass = cn(
  'relative inline-flex size-10 items-center justify-center rounded-[5px] text-canvas transition-colors hover:text-primary',
  focusRing,
)

/** Props de {@link Header}. */
interface HeaderProps {
  /** Quantidade de itens no carrinho exibida no contador. */
  cartItemCount?: number
}

/**
 * Header global do Kurio: logo, navegação principal e ações (busca, entrar,
 * carrinho). Abaixo de `md`, a navegação vai para um menu modal acessível.
 *
 * @param props - {@link HeaderProps}
 * @returns Elemento `header` da aplicação.
 * @example
 * <Header cartItemCount={cartItems.length} />
 */
export function Header({ cartItemCount = 0 }: HeaderProps) {
  const menuDialogRef = useRef<HTMLDialogElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const session = useQuery(sessionQueryOptions())
  const logout = useLogout()
  const user = session.data?.user

  const cartLabel = cartItemCount === 1 ? 'Carrinho, 1 item' : `Carrinho, ${cartItemCount} itens`

  function openMenu() {
    // `showModal` dá de graça foco preso, Esc e fundo inerte.
    menuDialogRef.current?.showModal()
  }

  function closeMenu() {
    menuDialogRef.current?.close()
  }

  function restoreFocusToTrigger() {
    menuTriggerRef.current?.focus()
  }

  return (
    <header className="border-b border-surface-dark bg-ink text-canvas">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 xl:px-0">
        <Link
          to="/"
          search={DEFAULT_NFT_LIST_QUERY}
          className={cn(
            'rounded-[3px] font-mono text-base font-bold tracking-widest text-primary',
            focusRing,
          )}
          aria-label="Kurio, página inicial"
        >
          KURIO
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-8">
            <li>
              <Link
                to="/"
                search={DEFAULT_NFT_LIST_QUERY}
                activeOptions={{ exact: true }}
                className={navLinkClass}
              >
                Início
              </Link>
            </li>
            <li>
              <Link to="/" search={DEFAULT_NFT_LIST_QUERY} className={navLinkClass}>
                Mercado
              </Link>
            </li>
            {COMING_SOON_SECTIONS.map((section) => (
              <li key={section}>
                <a
                  href="#"
                  aria-disabled="true"
                  title={`${section} — em breve`}
                  onClick={(event) => event.preventDefault()}
                  className={comingSoonLinkClass}
                >
                  {section}
                  <span className="sr-only"> (em breve)</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            aria-label="Buscar NFTs (em breve)"
            title="Busca — em breve"
            aria-disabled="true"
            className={cn(iconButtonClass, 'cursor-not-allowed')}
          >
            <Search aria-hidden="true" className="size-5" />
          </button>

          <Link to="/carrinho" aria-label={cartLabel} className={iconButtonClass}>
            <ShoppingCart aria-hidden="true" className="size-5" />
            {cartItemCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute top-1 right-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-bold text-ink"
              >
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                to="/carteiras"
                className={cn(
                  'text-sm text-canvas transition-colors hover:text-primary',
                  focusRing,
                )}
              >
                Carteiras
              </Link>
              <Link
                to="/perfil"
                className={cn(
                  'max-w-32 truncate text-sm text-canvas transition-colors hover:text-primary',
                  focusRing,
                )}
              >
                {user.name}
              </Link>
              <button
                type="button"
                onClick={() => logout.mutate()}
                className={cn(
                  'rounded-[5px] border border-surface-dark px-3 py-1.5 text-sm text-canvas transition-colors hover:border-error/60 hover:text-error',
                  focusRing,
                )}
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              search={{}}
              className={cn(
                'hidden items-center gap-1.5 rounded-[5px] bg-primary px-3 py-1.5 text-sm font-bold text-ink shadow-button transition-colors hover:bg-highlight sm:inline-flex',
                focusRing,
              )}
            >
              <LogIn aria-hidden="true" className="size-4" />
              Entrar
            </Link>
          )}

          <button
            ref={menuTriggerRef}
            type="button"
            aria-label="Abrir menu"
            aria-haspopup="dialog"
            aria-controls="menu-mobile"
            onClick={openMenu}
            className={cn(iconButtonClass, 'md:hidden')}
          >
            <Menu aria-hidden="true" className="size-6" />
          </button>
        </div>
      </div>

      <dialog
        ref={menuDialogRef}
        id="menu-mobile"
        aria-label="Menu"
        onClose={restoreFocusToTrigger}
        onClick={(event) => {
          // Clique no backdrop chega com o próprio dialog como alvo.
          if (event.target === event.currentTarget) closeMenu()
        }}
        className="m-0 ml-auto h-dvh max-h-none w-[min(20rem,85vw)] max-w-none bg-surface-card p-0 text-canvas shadow-option backdrop:bg-ink/70 md:hidden"
      >
        <div className="flex h-full flex-col gap-6 p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-base font-bold tracking-widest text-primary">
              KURIO
            </span>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={closeMenu}
              className={iconButtonClass}
            >
              <X aria-hidden="true" className="size-6" />
            </button>
          </div>

          <nav aria-label="Principal (mobile)">
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  to="/"
                  search={DEFAULT_NFT_LIST_QUERY}
                  activeOptions={{ exact: true }}
                  onClick={closeMenu}
                  className={cn(navLinkClass, 'w-full')}
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  search={DEFAULT_NFT_LIST_QUERY}
                  onClick={closeMenu}
                  className={cn(navLinkClass, 'w-full')}
                >
                  Mercado
                </Link>
              </li>
              {COMING_SOON_SECTIONS.map((section) => (
                <li key={section}>
                  <a
                    href="#"
                    aria-disabled="true"
                    title={`${section} — em breve`}
                    onClick={(event) => event.preventDefault()}
                    className={cn(comingSoonLinkClass, 'w-full justify-between')}
                  >
                    {section}
                    <span className="text-xs">em breve</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {user ? (
            <button
              type="button"
              onClick={() => logout.mutate()}
              className={cn(
                'mt-auto inline-flex items-center justify-center gap-2 rounded-[5px] border border-surface-dark px-4 py-2.5 text-sm text-canvas',
                focusRing,
              )}
            >
              Sair
            </button>
          ) : (
            <Link
              to="/login"
              search={{}}
              className={cn(
                'mt-auto inline-flex items-center justify-center gap-2 rounded-[5px] bg-primary px-4 py-2.5 text-sm font-bold text-ink shadow-button transition-colors hover:bg-highlight',
                focusRing,
              )}
            >
              <LogIn aria-hidden="true" className="size-4" />
              Entrar
            </Link>
          )}
        </div>
      </dialog>
    </header>
  )
}
