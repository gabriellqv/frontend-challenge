import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { useCreateWallet, useUpdateWallet, walletsQueryOptions } from '@/features/account/api'
import { type CreateWalletRequest, createWalletRequestSchema } from '@/shared/contracts'
import { getToken } from '@/shared/session'

export const Route = createFileRoute('/carteiras')({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: '/login', search: { redirect: '/carteiras' } })
  },
  component: WalletsPage,
})

const NETWORKS = ['Ethereum', 'Polygon', 'Solana'] as const

const fieldClass =
  'mt-1 w-full rounded-[6px] border border-surface-dark bg-surface-card px-3 py-2 text-canvas aria-[invalid=true]:border-error'

function WalletsPage() {
  const walletsQuery = useQuery(walletsQueryOptions())
  const createWallet = useCreateWallet()
  const updateWallet = useUpdateWallet()

  const form = useForm<CreateWalletRequest>({
    resolver: zodResolver(createWalletRequestSchema),
    defaultValues: { address: '', network: 'Polygon', label: '' },
  })

  const wallets = walletsQuery.data ?? []

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
      <h1 className="mb-6 font-mono text-2xl font-bold text-ink">Carteiras</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section aria-label="Suas carteiras">
          {wallets.length === 0 ? (
            <p className="rounded-[16px] border border-surface-dark bg-surface-card p-5 text-sm text-text-secondary">
              Nenhuma carteira cadastrada ainda.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {wallets.map((wallet) => (
                <li
                  key={wallet.id}
                  className="flex flex-col gap-2 rounded-[16px] border border-surface-dark bg-surface-card p-4 text-canvas sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-bold">
                      {wallet.label ?? 'Carteira'}
                      {wallet.isPrimary && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-ink">
                          Principal
                        </span>
                      )}
                    </p>
                    <p className="truncate text-sm text-text-secondary">
                      {wallet.address} · {wallet.network}
                    </p>
                  </div>
                  {!wallet.isPrimary && (
                    <button
                      type="button"
                      onClick={() => updateWallet.mutate({ id: wallet.id, isPrimary: true })}
                      className="rounded-[5px] border border-surface-dark px-3 py-1.5 text-sm text-text-secondary transition-colors hover:border-primary/60 hover:text-primary"
                    >
                      Tornar principal
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-[16px] border border-surface-dark bg-surface-card p-5 text-canvas">
          <h2 className="font-mono text-lg font-bold">Nova carteira</h2>
          <form
            className="mt-4 flex flex-col gap-4"
            onSubmit={form.handleSubmit((values) =>
              createWallet.mutate(
                { ...values, label: values.label ? values.label : null },
                { onSuccess: () => form.reset() },
              ),
            )}
            noValidate
          >
            <div>
              <label htmlFor="address" className="text-sm text-text-secondary">
                Endereço
              </label>
              <input
                id="address"
                placeholder="0x…"
                aria-invalid={Boolean(form.formState.errors.address)}
                aria-describedby="address-error"
                className={fieldClass}
                {...form.register('address')}
              />
              {form.formState.errors.address && (
                <p id="address-error" role="alert" className="mt-1 text-xs text-error">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="network" className="text-sm text-text-secondary">
                Rede
              </label>
              <select id="network" className={fieldClass} {...form.register('network')}>
                {NETWORKS.map((network) => (
                  <option key={network} value={network}>
                    {network}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="label" className="text-sm text-text-secondary">
                Apelido (opcional)
              </label>
              <input id="label" className={fieldClass} {...form.register('label')} />
            </div>

            {createWallet.error && (
              <p role="alert" className="text-sm text-error">
                Não foi possível cadastrar a carteira.
              </p>
            )}

            <button
              type="submit"
              disabled={createWallet.isPending}
              className="self-start rounded-[5px] bg-primary px-4 py-2 text-sm font-bold text-ink disabled:opacity-50"
            >
              {createWallet.isPending ? 'Cadastrando…' : 'Cadastrar'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
