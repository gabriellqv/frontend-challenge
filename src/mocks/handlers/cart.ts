import { HttpResponse, http } from 'msw'

import type {
  AddCartItemRequest,
  Cart,
  CartItem,
  CouponType,
  Quote,
  QuoteRequest,
  UpdateCartItemRequest,
} from '@/shared/contracts'
import { add, compare, div, mul, sub } from '@/shared/lib/money'

import { getDb, persist } from '../db'
import { errorResponse, getOwnerKey } from '../utils'

type CouponDefinition = { type: CouponType; value: string; expired?: boolean }

const COUPONS: Record<string, CouponDefinition> = {
  KURIO10: { type: 'percent', value: '10' },
  LANCAMENTO5: { type: 'percent', value: '5' },
  EXPIRADO20: { type: 'percent', value: '20', expired: true },
}

function getCart(ownerKey: string): Cart {
  return getDb().carts[ownerKey] ?? { items: [], version: 0 }
}

function resolveEdition(nftId: string, editionId: string) {
  const nft = getDb().nfts.find((n) => n.id === nftId)
  if (!nft) return null
  const edition = nft.editions.find((e) => e.id === editionId)
  if (!edition) return null
  return { nft, edition }
}

export const cartHandlers = [
  http.get('/api/cart', ({ request }) => {
    return HttpResponse.json(getCart(getOwnerKey(request)))
  }),

  http.post('/api/cart/items', async ({ request }) => {
    const body = (await request.json()) as AddCartItemRequest
    const resolved = resolveEdition(body.nftId, body.editionId)
    if (!resolved) return errorResponse('NOT_FOUND', 'NFT ou edição não encontrados', 404)

    const db = getDb()
    const ownerKey = getOwnerKey(request)
    const cart = getCart(ownerKey)
    const existing = cart.items.find(
      (i) => i.nftId === body.nftId && i.editionId === body.editionId,
    )
    const newQuantity = (existing?.quantity ?? 0) + body.quantity

    if (resolved.edition.available < newQuantity) {
      return errorResponse('AVAILABILITY_CONFLICT', 'Estoque insuficiente para esta edição', 409)
    }

    if (existing) {
      existing.quantity = newQuantity
      existing.name = resolved.nft.name
      existing.imageUrl = resolved.nft.imageUrl
      existing.priceEth = resolved.nft.priceEth
      existing.available = resolved.edition.available
    } else {
      const item: CartItem = {
        id: `ci-${crypto.randomUUID()}`,
        nftId: resolved.nft.id,
        editionId: resolved.edition.id,
        name: resolved.nft.name,
        imageUrl: resolved.nft.imageUrl,
        quantity: body.quantity,
        priceEth: resolved.nft.priceEth,
        available: resolved.edition.available,
      }
      cart.items.push(item)
    }

    cart.version += 1
    db.carts[ownerKey] = cart
    persist()
    return HttpResponse.json(cart)
  }),

  http.patch('/api/cart/items/:itemId', async ({ request, params }) => {
    const body = (await request.json()) as UpdateCartItemRequest
    const db = getDb()
    const ownerKey = getOwnerKey(request)
    const cart = getCart(ownerKey)
    const item = cart.items.find((i) => i.id === params.itemId)
    if (!item) return errorResponse('NOT_FOUND', 'Item não encontrado no carrinho', 404)

    const resolved = resolveEdition(item.nftId, item.editionId)
    if (!resolved) return errorResponse('NOT_FOUND', 'NFT ou edição não encontrados', 404)

    if (resolved.edition.available < body.quantity) {
      return errorResponse('AVAILABILITY_CONFLICT', 'Estoque insuficiente para esta edição', 409)
    }

    item.quantity = body.quantity
    item.available = resolved.edition.available
    cart.version += 1
    db.carts[ownerKey] = cart
    persist()
    return HttpResponse.json(cart)
  }),

  http.delete('/api/cart/items/:itemId', ({ request, params }) => {
    const db = getDb()
    const ownerKey = getOwnerKey(request)
    const cart = getCart(ownerKey)
    cart.items = cart.items.filter((i) => i.id !== params.itemId)
    cart.version += 1
    db.carts[ownerKey] = cart
    persist()
    return HttpResponse.json(cart)
  }),

  http.post('/api/quote', async ({ request }) => {
    const body = (await request.json()) as QuoteRequest
    const db = getDb()

    let subtotalEth = '0'
    for (const item of body.items) {
      const nft = db.nfts.find((n) => n.id === item.nftId)
      if (!nft) return errorResponse('NOT_FOUND', 'NFT não encontrado', 404)
      const edition = nft.editions.find((e) => e.id === item.editionId)
      if (!edition) return errorResponse('NOT_FOUND', 'Edição não encontrada', 404)
      if (edition.available < item.quantity) {
        return errorResponse('AVAILABILITY_CONFLICT', 'Estoque insuficiente para esta edição', 409)
      }
      subtotalEth = add(subtotalEth, mul(nft.priceEth, String(item.quantity)))
    }

    let discountEth = '0'
    if (body.couponCode) {
      const coupon = COUPONS[body.couponCode]
      if (!coupon) return errorResponse('COUPON_INVALID', 'Cupom inválido', 422)
      if (coupon.expired) return errorResponse('COUPON_EXPIRED', 'Cupom expirado', 422)
      discountEth =
        coupon.type === 'percent'
          ? mul(subtotalEth, div(coupon.value, '100'))
          : compare(coupon.value, subtotalEth) > 0
            ? subtotalEth
            : coupon.value
    }

    const networkFeeEth = mul(subtotalEth, '0.025')
    const totalEth = add(sub(subtotalEth, discountEth), networkFeeEth)

    const quote: Quote = {
      subtotalEth,
      discountEth,
      networkFeeEth,
      totalEth,
      version: getCart(getOwnerKey(request)).version,
    }
    return HttpResponse.json(quote)
  }),
]
