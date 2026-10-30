import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/carrinho')({
  component: CartPage,
})

function CartPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 xl:px-0">
      <h1 className="font-mono text-2xl font-bold text-ink">Carrinho</h1>
      <p className="mt-2 text-sm text-text-secondary">Carrinho será implementado na Fase 5.</p>
    </div>
  )
}
