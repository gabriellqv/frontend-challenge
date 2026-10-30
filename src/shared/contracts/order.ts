import { z } from 'zod'

import { ethSchema, idSchema, isoDateSchema } from './common'

export const orderStatusSchema = z.enum(['pending', 'confirmed', 'declined'])
export type OrderStatus = z.infer<typeof orderStatusSchema>

/** Item do pedido — snapshot imutável no momento da criação (recibo). */
export const orderItemSnapshotSchema = z.object({
  nftId: idSchema,
  editionId: idSchema,
  name: z.string(),
  quantity: z.number().int().min(1),
  priceEth: ethSchema,
})
export type OrderItemSnapshot = z.infer<typeof orderItemSnapshotSchema>

export const orderSchema = z.object({
  id: idSchema,
  status: orderStatusSchema,
  items: z.array(orderItemSnapshotSchema),
  subtotalEth: ethSchema,
  discountEth: ethSchema,
  networkFeeEth: ethSchema,
  totalEth: ethSchema,
  transactionRef: z.string().nullable(),
  version: z.number().int().min(0),
  createdAt: isoDateSchema,
})
export type Order = z.infer<typeof orderSchema>

/**
 * Criação de pedido. `Idempotency-Key` é obrigatória no header HTTP.
 * Mesma chave + mesmo corpo = mesmo pedido; chave reusada com corpo diferente = 409.
 */
export const createOrderRequestSchema = z.object({
  items: z.array(
    z.object({
      nftId: idSchema,
      editionId: idSchema,
      quantity: z.number().int().min(1),
    }),
  ),
  couponCode: z.string().optional(),
  walletAddress: z.string(),
  network: z.string(),
})
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>
