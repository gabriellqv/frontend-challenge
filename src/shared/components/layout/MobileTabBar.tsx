import { useQuery } from '@tanstack/react-query'
import { Link, useRouterState } from '@tanstack/react-router'

import { Heart, Home, ShoppingCart, User } from 'lucide-react'

import { sessionQueryOptions } from '@/features/auth/api'
import { cartQueryOptions } from '@/features/cart/api'
import { DEFAULT_NFT_LIST_QUERY } from '@/shared/contracts'
import { cn } from '@/shared/lib/cn'

/**
 * Barra de navegação inferior mobile (Tab Bar) conforme a especificação do Figma:
 * - Altura com área de toque confortável e fundo #241612
 * - Botão flutuante central com gradiente e logo Kurio
 * - Ícones Home, Favoritos, Carrinho (com badge) e Perfil
 */
export function MobileTabBar() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const session = useQuery(sessionQueryOptions())
  const cartQuery = useQuery(cartQueryOptions())
  const user = session.data?.user

  const totalCartCount = cartQuery.data?.items.reduce((acc, item) => acc + item.quantity, 0) ?? 0

  const isHome = pathname === '/'
  const isCart = pathname === '/carrinho'
  const isProfile =
    pathname === '/perfil' ||
    pathname === '/carteiras' ||
    pathname === '/login' ||
    pathname === '/cadastro'

  if (
    pathname.startsWith('/nft/') ||
    pathname === '/carrinho' ||
    pathname === '/pagamento' ||
    pathname === '/login' ||
    pathname === '/cadastro'
  ) {
    return null
  }

  return (
    <nav
      aria-label="Navegação móvel"
      className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#3F2319]/40 bg-[#241612] shadow-[0px_-10px_30px_rgba(10,6,4,0.45)] md:hidden"
    >
      <div className="relative mx-auto flex h-[68px] max-w-[414px] items-center justify-around px-4 pb-2">
        {/* Home */}
        <Link
          to="/"
          search={DEFAULT_NFT_LIST_QUERY}
          className={cn(
            'flex flex-col items-center justify-center p-2 transition-colors',
            isHome ? 'text-[#E89B55]' : 'text-[#CFB28C] hover:text-[#E89B55]',
          )}
          aria-label="Início"
        >
          <Home className="size-6" strokeWidth={isHome ? 2.5 : 2} />
        </Link>

        {/* Favoritos */}
        <button
          type="button"
          onClick={() => {
            if (pathname === '/') {
              document.getElementById('catalogo-section')?.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="flex flex-col items-center justify-center p-2 text-[#CFB28C] transition-colors hover:text-[#E89B55]"
          aria-label="Favoritos"
        >
          <Heart className="size-6" strokeWidth={2} />
        </button>

        {/* Floating Center Action Button (Ellipse 39) */}
        <div className="relative -top-5 flex items-center justify-center">
          <Link
            to="/"
            search={DEFAULT_NFT_LIST_QUERY}
            className="flex size-[58px] cursor-pointer items-center justify-center rounded-full border-2 border-[#140D0A] shadow-[0px_4px_16px_rgba(210,138,76,0.45)] transition-transform active:scale-95"
            style={{
              background:
                'linear-gradient(180deg, rgba(210, 138, 76, 0.5) -16.92%, #D28A4C 109.23%)',
            }}
            aria-label="Kurio Explorar"
          >
            {/* Kurio Monogram / Brand Icon */}
            <svg
              viewBox="0 0 24 24"
              className="size-7 text-[#F5F1EB]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="6" />
              <path d="M7 8h10M7 12h10M7 16h6" />
            </svg>
          </Link>
        </div>

        {/* Carrinho / Shop */}
        <Link
          to="/carrinho"
          className={cn(
            'relative flex flex-col items-center justify-center p-2 transition-colors',
            isCart ? 'text-[#E89B55]' : 'text-[#CFB28C] hover:text-[#E89B55]',
          )}
          aria-label={`Carrinho com ${totalCartCount} itens`}
        >
          <ShoppingCart className="size-6" strokeWidth={isCart ? 2.5 : 2} />
          {totalCartCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[10px] font-bold text-ink"
            >
              {totalCartCount > 99 ? '99+' : totalCartCount}
            </span>
          )}
        </Link>

        {/* Perfil / User */}
        <Link
          to={user ? '/perfil' : '/login'}
          className={cn(
            'flex flex-col items-center justify-center p-2 transition-colors',
            isProfile ? 'text-[#E89B55]' : 'text-[#CFB28C] hover:text-[#E89B55]',
          )}
          aria-label={user ? 'Meu Perfil' : 'Entrar na conta'}
        >
          <User className="size-6" strokeWidth={isProfile ? 2.5 : 2} />
        </Link>
      </div>
    </nav>
  )
}
