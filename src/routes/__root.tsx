import { Outlet, createRootRoute, useRouterState } from '@tanstack/react-router'

import { Footer } from '@/shared/components/layout/Footer'
import { Header } from '@/shared/components/layout/Header'
import { MobileTabBar } from '@/shared/components/layout/MobileTabBar'
import { SkipToContent } from '@/shared/components/layout/SkipToContent'
import { cn } from '@/shared/lib/cn'
import { Toaster } from '@/shared/ui/sonner'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const isNftDetail = pathname.startsWith('/nft/')
  const isNoTabBar =
    isNftDetail ||
    pathname === '/carrinho' ||
    pathname === '/pagamento' ||
    pathname === '/login' ||
    pathname === '/cadastro'

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col bg-background text-foreground',
        isNftDetail && 'max-md:h-[100dvh] max-md:max-h-[100dvh] max-md:overflow-hidden',
      )}
    >
      <SkipToContent />
      <Header />
      <main
        id="conteudo"
        tabIndex={-1}
        className={cn(
          'flex-1 flex flex-col',
          !isNoTabBar && 'pb-28 md:pb-0',
          isNftDetail && 'max-md:h-full max-md:pb-0',
        )}
      >
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
      <Toaster />
    </div>
  )
}
