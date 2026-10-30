import { Link, createFileRoute } from '@tanstack/react-router'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useRegister } from '@/features/auth/api'
import { ApiError } from '@/shared/api/http-client'
import {
  DEFAULT_NFT_LIST_QUERY,
  type RegisterRequest,
  registerRequestSchema,
} from '@/shared/contracts'

export const Route = createFileRoute('/cadastro')({
  component: RegisterPage,
})

const fieldClass =
  'mt-1 w-full rounded-[6px] border border-surface-dark bg-surface-card px-3 py-2 text-canvas aria-[invalid=true]:border-error'

function RegisterPage() {
  const navigate = Route.useNavigate()
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  const apiError = registerMutation.error instanceof ApiError ? registerMutation.error : null

  function onSubmit(values: RegisterRequest) {
    registerMutation.mutate(values, {
      onSuccess: () => navigate({ to: '/', search: DEFAULT_NFT_LIST_QUERY }),
    })
  }

  return (
    <div className="mx-auto w-full max-w-[400px] px-4 py-16">
      <h1 className="font-mono text-2xl font-bold text-ink">Criar conta</h1>
      <p className="mt-1 text-sm text-text-secondary">Comece sua coleção na Kurio.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="name" className="text-sm text-text-secondary">
            Nome
          </label>
          <input
            id="name"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby="name-error"
            className={fieldClass}
            {...register('name')}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="mt-1 text-xs text-error">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="text-sm text-text-secondary">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby="email-error"
            className={fieldClass}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-xs text-error">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="text-sm text-text-secondary">
            Senha
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby="password-error"
            className={fieldClass}
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="mt-1 text-xs text-error">
              {errors.password.message}
            </p>
          )}
        </div>

        {apiError && (
          <p role="alert" className="text-sm text-error">
            {apiError.message}
          </p>
        )}

        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="rounded-[5px] bg-primary px-4 py-2.5 text-sm font-bold text-ink disabled:opacity-50"
        >
          {registerMutation.isPending ? 'Criando…' : 'Criar conta'}
        </button>
      </form>

      <p className="mt-6 text-sm text-text-secondary">
        Já tem conta?{' '}
        <Link to="/login" search={{}} className="text-primary underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
