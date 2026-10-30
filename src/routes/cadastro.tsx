import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/cadastro')({
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-[400px] px-4 py-16">
      <h1 className="font-mono text-2xl font-bold text-ink">Criar conta</h1>
      <p className="mt-2 text-sm text-text-secondary">Cadastro será implementado na Fase 6.</p>
    </div>
  )
}
