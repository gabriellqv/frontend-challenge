import { Outlet, createRootRoute } from '@tanstack/react-router'

import { Footer } from '@/shared/components/layout/Footer'
import { Header } from '@/shared/components/layout/Header'
import { MobileTabBar } from '@/shared/components/layout/MobileTabBar'
import { SkipToContent } from '@/shared/components/layout/SkipToContent'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SkipToContent />
      <Header />
      <main id="conteudo" tabIndex={-1} className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  )
}
