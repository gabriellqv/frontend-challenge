import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/pagamento')({
  component: CheckoutPage,
})

function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 xl:px-0">
      <h1 className="font-mono text-2xl font-bold text-ink">Pagamento</h1>
      <p className="mt-2 text-sm text-text-secondary">Checkout será implementado na Fase 5.</p>
    </div>
  )
}
