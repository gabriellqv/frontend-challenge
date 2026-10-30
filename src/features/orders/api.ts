import { queryOptions, useMutation } from '@tanstack/react-query'

import { getJson, postJson } from '@/shared/api/http-client'
import { queryKeys } from '@/shared/api/query-keys'
import { type CreateOrderRequest, orderSchema } from '@/shared/contracts'
import { getOwnerKey } from '@/shared/session'

/**
 * Estado e recibo de um pedido.
 *
 * @param id - Identificador do pedido.
 * @returns Opções do TanStack Query para o pedido.
 */
export function orderQueryOptions(id: string) {
  return queryOptions({
    queryKey: queryKeys.orders.detail(getOwnerKey(), id),
    queryFn: () => getJson(orderSchema, `/orders/${id}`),
  })
}

/**
 * Cria um pedido idempotente. A mesma `Idempotency-Key` recupera o mesmo pedido
 * em caso de timeout/reenvio.
 */
export function useCreateOrder() {
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: CreateOrderRequest; idempotencyKey: string }) =>
      postJson(orderSchema, '/orders', body, {
        headers: { 'Idempotency-Key': idempotencyKey },
      }),
  })
}
