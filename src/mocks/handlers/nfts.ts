import { HttpResponse, delay, http } from 'msw'

import { nftListQuerySchema } from '@/shared/contracts'

import { getDb } from '../db'
import { getLatencyMs, isOffline } from '../scenarios'
import { errorResponse } from '../utils'

export const nftHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    if (isOffline()) return HttpResponse.error()
    const latency = getLatencyMs()
    if (latency > 0) await delay(latency)

    const url = new URL(request.url)
    const query = nftListQuerySchema.parse({
      q: url.searchParams.get('q') ?? undefined,
      collection: url.searchParams.get('collection') ?? undefined,
      network: url.searchParams.get('network') ?? undefined,
      priceMin: url.searchParams.get('priceMin') ?? undefined,
      priceMax: url.searchParams.get('priceMax') ?? undefined,
      sort: url.searchParams.get('sort') ?? undefined,
      page: url.searchParams.get('page') ?? undefined,
      pageSize: url.searchParams.get('pageSize') ?? undefined,
    })

    let items = getDb().nfts.slice()

    if (query.q) {
      const q = query.q.toLowerCase()
      items = items.filter(
        (n) => n.name.toLowerCase().includes(q) || n.collection.toLowerCase().includes(q),
      )
    }
    if (query.collection) items = items.filter((n) => n.collection === query.collection)
    if (query.network) items = items.filter((n) => n.network === query.network)
    if (query.priceMin) items = items.filter((n) => Number(n.priceEth) >= Number(query.priceMin))
    if (query.priceMax) items = items.filter((n) => Number(n.priceEth) <= Number(query.priceMax))

    if (query.sort === 'price_asc') items.sort((a, b) => Number(a.priceEth) - Number(b.priceEth))
    if (query.sort === 'price_desc') items.sort((a, b) => Number(b.priceEth) - Number(a.priceEth))

    const total = items.length
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize))
    const start = (query.page - 1) * query.pageSize
    const pageItems = items.slice(start, start + query.pageSize)

    return HttpResponse.json({
      items: pageItems,
      pagination: { page: query.page, pageSize: query.pageSize, total, totalPages },
    })
  }),

  http.get('/api/nfts/:id', ({ params }) => {
    const nft = getDb().nfts.find((n) => n.id === params.id)
    if (!nft) return errorResponse('NOT_FOUND', 'NFT não encontrado', 404)
    return HttpResponse.json(nft)
  }),
]
