import { HttpResponse, http } from 'msw'

import { nftListQuerySchema } from '@/shared/contracts'

import { getDb } from '../db'
import { simulateNetwork } from '../scenarios'
import { errorResponse } from '../utils'

export const nftHandlers = [
  http.get('/api/nfts', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const url = new URL(request.url)

    const cleanParam = (v: string | null) => {
      if (!v) return undefined
      const s = v.replace(/^"|"$/g, '').trim()
      if (s === '' || s === 'undefined' || s === 'null') return undefined
      return s
    }

    const rawQuery = {
      q: cleanParam(url.searchParams.get('q')),
      collection: cleanParam(url.searchParams.get('collection')),
      network: cleanParam(url.searchParams.get('network')),
      priceMin: cleanParam(url.searchParams.get('priceMin')),
      priceMax: cleanParam(url.searchParams.get('priceMax')),
      sort: cleanParam(url.searchParams.get('sort')),
      page: cleanParam(url.searchParams.get('page')),
      pageSize: cleanParam(url.searchParams.get('pageSize')),
    }

    const parsedQuery = nftListQuerySchema.safeParse(rawQuery)
    const query = parsedQuery.success
      ? parsedQuery.data
      : {
          q: typeof rawQuery.q === 'string' ? rawQuery.q : undefined,
          collection: typeof rawQuery.collection === 'string' ? rawQuery.collection : undefined,
          network: undefined,
          priceMin: undefined,
          priceMax: undefined,
          sort: undefined,
          page: 1,
          pageSize: 9,
        }

    let items = getDb().nfts.slice()

    if (query.q) {
      const q = query.q.toLowerCase()
      items = items.filter(
        (n) => n.name.toLowerCase().includes(q) || n.collection.toLowerCase().includes(q),
      )
    }
    if (query.collection) {
      const c = query.collection.toLowerCase()
      items = items.filter(
        (n) =>
          n.collection.toLowerCase() === c ||
          (c === 'arte digital' && n.collection === 'Kurio Apes') ||
          (c === 'fotografia' && n.collection === 'Genesis Drops') ||
          (c === 'música' && n.collection === 'Kurio Editions') ||
          (c === 'musica' && n.collection === 'Kurio Editions') ||
          (c === 'arte 3d' && n.collection === 'Curated Art'),
      )
    }
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

  http.get('/api/nfts/:id', async ({ params }) => {
    const failure = await simulateNetwork()
    if (failure) return failure
    const nft = getDb().nfts.find((n) => n.id === params.id)
    if (!nft) return errorResponse('NOT_FOUND', 'NFT não encontrado', 404)
    return HttpResponse.json(nft)
  }),
]
