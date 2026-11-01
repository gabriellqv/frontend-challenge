import { z } from 'zod'

import { ethSchema, idSchema } from './common'
import { orderStatusSchema } from './order'

/**
 * Eventos Socket.IO. Todo evento carrega identidade estável (`eventId`), o
 * recurso afetado e a versão do recurso — o cliente descarta duplicatas e
 * versões antigas.
 */
export const nftUpdatedEventSchema = z.object({
  eventId: z.string().min(1),
  nftId: idSchema,
  version: z.number().int().min(0),
  priceEth: ethSchema,
  available: z.number().int().min(0),
  editions: z.array(
    z.object({
      id: idSchema,
      available: z.number().int().min(0),
    }),
  ),
})
export type NftUpdatedEvent = z.infer<typeof nftUpdatedEventSchema>

export const orderUpdatedEventSchema = z.object({
  eventId: z.string().min(1),
  orderId: idSchema,
  status: orderStatusSchema,
  version: z.number().int().min(0),
  /** Só a sessão deste usuário pode aplicar o evento. */
  userId: z.string().min(1),
})
export type OrderUpdatedEvent = z.infer<typeof orderUpdatedEventSchema>
