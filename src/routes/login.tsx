import { Link, createFileRoute } from '@tanstack/react-router'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useLogin } from '@/features/auth/api'
import { ApiError } from '@/shared/api/http-client'
import { DEFAULT_NFT_LIST_QUERY, type LoginRequest, loginRequestSchema } from '@/shared/contracts'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    const redirect = search.redirect
    return typeof redirect === 'string' ? { redirect } : {}
  },
  component: LoginPage,
})

const fieldClass =
  'mt-1 w-full rounded-[6px] border border-surface-dark bg-surface-card px-3 py-2 text-canvas aria-[invalid=true]:border-error'

function LoginPage() {
  const navigate = Route.useNavigate()
  const { redirect } = Route.useSearch()
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: '', password: '' },
  })

  const apiError = login.error instanceof ApiError ? login.error : null

  function onSubmit(values: LoginRequest) {
    login.mutate(values, {
      onSuccess: () => {
        if (redirect) window.location.assign(redirect)
        else navigate({ to: '/', search: DEFAULT_NFT_LIST_QUERY })
      },
    })
  }

  return (
    <div className="mx-auto w-full max-w-[400px] px-4 py-16">
      <h1 className="font-mono text-2xl font-bold text-ink">Entrar</h1>
      <p className="mt-1 text-sm text-text-secondary">Acesse sua conta para comprar e favoritar.</p>

      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            autoComplete="current-password"
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
          disabled={login.isPending}
          className="rounded-[5px] bg-primary px-4 py-2.5 text-sm font-bold text-ink disabled:opacity-50"
        >
          {login.isPending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-sm text-text-secondary">
        Não tem conta?{' '}
        <Link to="/cadastro" className="text-primary underline">
          Crie uma
        </Link>
      </p>

      <p className="mt-4 rounded-[8px] border border-surface-dark bg-surface-card px-3 py-2 text-xs text-text-secondary">
        Conta de teste: <strong className="text-canvas">nova@kurio.test</strong> /{' '}
        <strong className="text-canvas">kurio123</strong>
      </p>
    </div>
  )
}
