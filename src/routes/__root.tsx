import { Outlet, createRootRoute } from '@tanstack/react-router'

import { Footer } from '@/shared/components/layout/Footer'
import { Header } from '@/shared/components/layout/Header'
import { SkipToContent } from '@/shared/components/layout/SkipToContent'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-ink">
      <SkipToContent />
      <Header />
      <main id="conteudo" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
