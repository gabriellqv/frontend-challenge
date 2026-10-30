import { HttpResponse, http } from 'msw'

import type { Favorite } from '@/shared/contracts'

import { getDb, persist } from '../db'
import { errorResponse, getAuthenticatedUser, unauthorized } from '../utils'

export const favoritesHandlers = [
  http.get('/api/favorites', ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return unauthorized()

    const ids = getDb().favorites[user.id] ?? []
    const items: Favorite[] = ids.map((nftId) => ({
      nftId,
      addedAt: new Date().toISOString(),
    }))
    return HttpResponse.json({ items })
  }),

  http.post('/api/favorites/:nftId', ({ request, params }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return unauthorized()

    const db = getDb()
    const nft = db.nfts.find((n) => n.id === params.nftId)
    if (!nft) return errorResponse('NOT_FOUND', 'NFT não encontrado', 404)

    const ids = db.favorites[user.id] ?? []
    if (!ids.includes(nft.id)) {
      ids.push(nft.id)
      db.favorites[user.id] = ids
      persist()
    }

    const favorite: Favorite = { nftId: nft.id, addedAt: new Date().toISOString() }
    return HttpResponse.json(favorite)
  }),

  http.delete('/api/favorites/:nftId', ({ request, params }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return unauthorized()

    const db = getDb()
    const ids = db.favorites[user.id]
    if (ids) {
      db.favorites[user.id] = ids.filter((id) => id !== params.nftId)
      persist()
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
