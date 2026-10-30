import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'

import { orderQueryOptions } from '@/features/orders/api'
import { DEFAULT_NFT_LIST_QUERY, type OrderStatus } from '@/shared/contracts'
import { formatEth } from '@/shared/lib/money'
import { useRealtimeUpdates } from '@/shared/realtime/use-realtime'
import { getToken } from '@/shared/session'

export const Route = createFileRoute('/pedido/$orderId')({
  beforeLoad: ({ params }) => {
    if (!getToken())
      throw redirect({ to: '/login', search: { redirect: `/pedido/${params.orderId}` } })
  },
  component: OrderPage,
})

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Processando pagamento…',
  confirmed: 'Compra confirmada',
  declined: 'Pagamento recusado',
}

function OrderPage() {
  const { orderId } = Route.useParams()
  const orderQuery = useQuery(orderQueryOptions(orderId))
  useRealtimeUpdates()

  if (orderQuery.isLoading) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-4 py-16 text-center sm:px-6 xl:px-0">
        <p className="text-sm text-text-secondary">Carregando pedido…</p>
      </div>
    )
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-4 py-16 text-center sm:px-6 xl:px-0">
        <h1 className="font-mono text-2xl font-bold text-ink">Pedido não encontrado</h1>
        <Link
          to="/"
          search={DEFAULT_NFT_LIST_QUERY}
          className="mt-6 inline-flex rounded-[5px] bg-primary px-4 py-2 text-sm font-bold text-ink"
        >
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

  const order = orderQuery.data

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-12 sm:px-6 xl:px-0">
      <p
        className={
          order.status === 'confirmed'
            ? 'text-sm font-bold text-success'
            : order.status === 'declined'
              ? 'text-sm font-bold text-error'
              : 'text-sm font-bold text-text-secondary'
        }
        aria-live="polite"
      >
        {STATUS_LABEL[order.status]}
      </p>
      <h1 className="mt-2 font-mono text-2xl font-bold text-ink">Pedido {order.id}</h1>

      {order.transactionRef && (
        <p className="mt-2 text-sm text-text-secondary">
          Transação: <span className="break-all text-primary">{order.transactionRef}</span>
        </p>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {order.items.map((item) => (
          <li
            key={`${item.nftId}-${item.editionId}`}
            className="flex items-center justify-between gap-4 rounded-[12px] border border-surface-dark bg-surface-card px-4 py-3 text-sm text-canvas"
          >
            <span className="min-w-0 truncate">{item.name}</span>
            <span className="shrink-0 text-text-secondary">
              {item.quantity} × {formatEth(item.priceEth)} ETH
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-6 space-y-2 rounded-[16px] border border-surface-dark bg-surface-card p-4 text-sm text-canvas">
        <div className="flex justify-between">
          <dt className="text-text-secondary">Subtotal</dt>
          <dd>{formatEth(order.subtotalEth)} ETH</dd>
        </div>
        {order.discountEth !== '0' && (
          <div className="flex justify-between text-success">
            <dt>Desconto</dt>
            <dd>-{formatEth(order.discountEth)} ETH</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-text-secondary">Taxa de rede</dt>
          <dd>{formatEth(order.networkFeeEth)} ETH</dd>
        </div>
        <div className="flex justify-between border-t border-surface-dark pt-2 text-base font-bold">
          <dt>Total</dt>
          <dd className="text-primary">{formatEth(order.totalEth)} ETH</dd>
        </div>
      </dl>

      <Link
        to="/"
        search={DEFAULT_NFT_LIST_QUERY}
        className="mt-6 inline-flex rounded-[5px] bg-primary px-4 py-2 text-sm font-bold text-ink"
      >
        Continuar explorando
      </Link>
    </div>
  )
}
