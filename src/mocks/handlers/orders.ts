import { HttpResponse, http } from 'msw'

import type { CreateOrderRequest, Order } from '@/shared/contracts'

import { getDb, persist } from '../db'
import { QuoteError, computeTotals } from '../pricing'
import { errorResponse, getAuthenticatedUser } from '../utils'

export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return errorResponse('UNAUTHORIZED', 'Autenticação necessária', 401)

    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (!idempotencyKey) {
      return errorResponse('VALIDATION_ERROR', 'Cabeçalho Idempotency-Key é obrigatório', 422)
    }

    const body = (await request.json()) as CreateOrderRequest
    const db = getDb()

    // Idempotência: mesma chave recupera o mesmo pedido (timeout/reenvio não duplica).
    const existingOrderId = db.idempotency[idempotencyKey]
    if (existingOrderId && db.orders[existingOrderId]) {
      return HttpResponse.json(db.orders[existingOrderId])
    }

    // Monta o snapshot dos itens, revalidando disponibilidade.
    const items: Order['items'] = []
    for (const it of body.items) {
      const nft = db.nfts.find((n) => n.id === it.nftId)
      if (!nft) return errorResponse('NOT_FOUND', 'NFT não encontrado', 404)
      const edition = nft.editions.find((e) => e.id === it.editionId)
      if (!edition) return errorResponse('NOT_FOUND', 'Edição não encontrada', 404)
      if (edition.available < it.quantity) {
        return errorResponse('AVAILABILITY_CONFLICT', `Estoque insuficiente para ${nft.name}`, 409)
      }
      items.push({
        nftId: nft.id,
        editionId: edition.id,
        name: nft.name,
        quantity: it.quantity,
        priceEth: nft.priceEth,
      })
    }

    // Revalida cupom e recalcula totais.
    let totals
    try {
      totals = computeTotals(items, body.couponCode)
    } catch (e) {
      if (e instanceof QuoteError) return errorResponse(e.code, e.message, e.status)
      throw e
    }

    const order: Order = {
      id: `ord-${crypto.randomUUID()}`,
      status: 'pending',
      items,
      ...totals,
      transactionRef: null,
      version: 1,
      createdAt: new Date().toISOString(),
    }

    db.orders[order.id] = order
    db.idempotency[idempotencyKey] = order.id
    persist()

    return HttpResponse.json(order, { status: 201 })
  }),

  http.get('/api/orders/:id', ({ request, params }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return errorResponse('UNAUTHORIZED', 'Autenticação necessária', 401)
    const order = getDb().orders[params.id as string]
    if (!order) return errorResponse('NOT_FOUND', 'Pedido não encontrado', 404)
    return HttpResponse.json(order)
  }),
]
