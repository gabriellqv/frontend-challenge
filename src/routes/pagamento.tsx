import { useState } from 'react'

import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'

import { profileQueryOptions, walletsQueryOptions } from '@/features/account/api'
import { cartQueryOptions, quoteQueryOptions } from '@/features/cart/api'
import { useCreateOrder } from '@/features/orders/api'
import { ApiError } from '@/shared/api/http-client'
import { CartSummarySkeleton } from '@/shared/components/skeletons/CartSummarySkeleton'
import { createIdempotencyKey } from '@/shared/lib/hash'
import { formatEth } from '@/shared/lib/money'
import { getToken } from '@/shared/session'

const IDEMPOTENCY_STORAGE_KEY = 'kurio:checkout-idempotency'

export const Route = createFileRoute('/pagamento')({
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: '/login', search: { redirect: '/pagamento' } })
  },
  component: CheckoutPage,
})

/** Chave estável por tentativa: sobrevive a refresh/timeout e evita compra dupla. */
function useCheckoutIdempotencyKey(): string {
  const [key] = useState(() => {
    const stored = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY)
    if (stored) return stored
    const created = createIdempotencyKey()
    sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, created)
    return created
  })
  return key
}

function CheckoutPage() {
  const navigate = Route.useNavigate()
  const idempotencyKey = useCheckoutIdempotencyKey()

  const cartQuery = useQuery(cartQueryOptions())
  const walletsQuery = useQuery(walletsQueryOptions())
  const profileQuery = useQuery(profileQueryOptions())
  const createOrder = useCreateOrder()

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | undefined>(undefined)

  const items = cartQuery.data?.items ?? []
  const wallets = walletsQuery.data ?? []
  const wallet = wallets.find((item) => item.id === selectedWalletId) ?? wallets[0]

  const quoteRequest = {
    items: items.map((item) => ({
      nftId: item.nftId,
      editionId: item.editionId,
      quantity: item.quantity,
    })),
    ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
  }
  const quote = useQuery(quoteQueryOptions(quoteRequest))
  const couponError = quote.error instanceof ApiError ? quote.error : null
  const orderError = createOrder.error instanceof ApiError ? createOrder.error : null

  if (cartQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
        <CartSummarySkeleton />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-16 text-center sm:px-6 xl:px-0">
        <h1 className="font-mono text-2xl font-bold text-ink">Carrinho vazio</h1>
        <p className="mt-2 text-sm text-text-secondary">Adicione um NFT antes de finalizar.</p>
      </div>
    )
  }

  const canSubmit = Boolean(wallet) && Boolean(quote.data) && !createOrder.isPending

  function submit() {
    if (!wallet || !quote.data) return
    createOrder.mutate(
      {
        body: {
          items: quoteRequest.items,
          ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
          walletAddress: wallet.address,
          network: wallet.network,
        },
        idempotencyKey,
      },
      {
        onSuccess: (order) => {
          sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY)
          navigate({ to: '/pedido/$orderId', params: { orderId: order.id } })
        },
      },
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 xl:px-0">
      <h1 className="mb-6 font-mono text-2xl font-bold text-ink">Pagamento</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <section className="rounded-[16px] border border-surface-dark bg-surface-card p-4 text-canvas">
            <h2 className="text-sm font-bold">Dados do colecionador</h2>
            <p className="mt-2 text-sm text-text-secondary">
              {profileQuery.data?.name ?? '—'}
              <br />
              {profileQuery.data?.email ?? '—'}
            </p>
          </section>

          <section className="rounded-[16px] border border-surface-dark bg-surface-card p-4 text-canvas">
            <h2 className="text-sm font-bold">Carteira e rede</h2>
            {wallets.length === 0 ? (
              <p className="mt-2 text-sm text-text-secondary">
                Nenhuma carteira cadastrada.{' '}
                <Link to="/carteiras" className="text-primary underline">
                  Cadastrar carteira
                </Link>
              </p>
            ) : (
              <fieldset className="mt-3">
                <legend className="sr-only">Selecione a carteira</legend>
                <div className="flex flex-col gap-2">
                  {wallets.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-center gap-3 rounded-[8px] border border-surface-dark px-3 py-2 text-sm has-[:checked]:border-primary"
                    >
                      <input
                        type="radio"
                        name="wallet"
                        value={item.id}
                        checked={wallet?.id === item.id}
                        onChange={() => setSelectedWalletId(item.id)}
                        className="accent-primary"
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-bold">
                          {item.label ?? 'Carteira'} · {item.network}
                        </span>
                        <span className="block truncate text-xs text-text-secondary">
                          {item.address}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </section>

          <section className="rounded-[16px] border border-surface-dark bg-surface-card p-4 text-canvas">
            <h2 className="text-sm font-bold">Cupom</h2>
            {appliedCoupon ? (
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-primary">{appliedCoupon}</span>
                <button
                  type="button"
                  onClick={() => setAppliedCoupon(undefined)}
                  className="text-xs text-text-secondary underline"
                >
                  Remover
                </button>
              </div>
            ) : (
              <form
                className="mt-2 flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (couponInput.trim()) setAppliedCoupon(couponInput.trim().toUpperCase())
                }}
              >
                <input
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                  placeholder="Código"
                  aria-label="Código do cupom"
                  className="min-w-0 flex-1 rounded-[6px] border border-surface-dark bg-ink px-3 py-1.5 text-sm text-canvas"
                />
                <button
                  type="submit"
                  className="rounded-[5px] bg-primary px-3 py-1.5 text-sm font-bold text-ink"
                >
                  Aplicar
                </button>
              </form>
            )}
            {couponError && (
              <p role="alert" className="mt-2 text-xs text-error">
                {couponError.code === 'COUPON_EXPIRED' ? 'Cupom expirado.' : 'Cupom inválido.'}
              </p>
            )}
          </section>
        </div>

        <aside className="rounded-[16px] border border-surface-dark bg-surface-card p-4 text-canvas">
          <h2 className="text-sm font-bold">Revisão</h2>
          {quote.isLoading ? (
            <CartSummarySkeleton lineCount={2} />
          ) : quote.data ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Subtotal</dt>
                <dd>{formatEth(quote.data.subtotalEth)} ETH</dd>
              </div>
              {quote.data.discountEth !== '0' && (
                <div className="flex justify-between text-success">
                  <dt>Desconto</dt>
                  <dd>-{formatEth(quote.data.discountEth)} ETH</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-text-secondary">Taxa de rede</dt>
                <dd>{formatEth(quote.data.networkFeeEth)} ETH</dd>
              </div>
              <div className="flex justify-between border-t border-surface-dark pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd className="text-primary">{formatEth(quote.data.totalEth)} ETH</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-error">Não foi possível calcular o total.</p>
          )}

          {orderError && (
            <p role="alert" className="mt-3 text-sm text-error">
              {orderError.message}
            </p>
          )}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={submit}
            className="mt-4 inline-flex w-full justify-center rounded-[5px] bg-primary px-4 py-2.5 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createOrder.isPending ? 'Enviando…' : 'Confirmar compra'}
          </button>
        </aside>
      </div>
    </div>
  )
}
