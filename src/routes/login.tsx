import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-[400px] px-4 py-16">
      <h1 className="font-mono text-2xl font-bold text-ink">Entrar</h1>
      <p className="mt-2 text-sm text-text-secondary">Autenticação será implementada na Fase 6.</p>
    </div>
  )
}
