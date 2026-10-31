import { HttpResponse, http } from 'msw'

import type { LoginRequest, RegisterRequest, Session } from '@/shared/contracts'

import { type UserRecord, getDb, hashPassword, persist } from '../db'
import { errorResponse, getAuthenticatedUser, getToken, getVisitorId } from '../utils'

export const SESSION_TTL_MS = 60 * 60 * 1000 // 1h (cenários podem encurtar)

/** Preserva os itens do carrinho do visitante ao autenticar (merge no login). */
function mergeVisitorCart(request: Request, userToken: string): void {
  const visitorId = getVisitorId(request)
  if (!visitorId) return

  const db = getDb()
  const visitorKey = `visitor:${visitorId}`
  const visitorCart = db.carts[visitorKey]
  if (!visitorCart || visitorCart.items.length === 0) return

  const userKey = `user:${userToken}`
  const userCart = db.carts[userKey] ?? { items: [], version: 0 }
  for (const item of visitorCart.items) {
    const existing = userCart.items.find(
      (i) => i.nftId === item.nftId && i.editionId === item.editionId,
    )
    if (existing) existing.quantity += item.quantity
    else userCart.items.push(item)
  }
  userCart.version += 1
  db.carts[userKey] = userCart
  delete db.carts[visitorKey]
  persist()
}

/** Preserva os favoritos do visitante ao autenticar (merge no login). */
function mergeVisitorFavorites(request: Request, userId: string): void {
  const visitorId = getVisitorId(request)
  if (!visitorId) return

  const db = getDb()
  const visitorKey = `visitor:${visitorId}`
  const visitorFavorites = db.favorites[visitorKey]
  if (!visitorFavorites || visitorFavorites.length === 0) return

  const userFavorites = db.favorites[userId] ?? []
  for (const nftId of visitorFavorites) {
    if (!userFavorites.includes(nftId)) userFavorites.push(nftId)
  }
  db.favorites[userId] = userFavorites
  delete db.favorites[visitorKey]
  persist()
}

function buildSession(user: UserRecord): Session {
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()
  getDb().sessions[token] = { token, userId: user.id, expiresAt }
  persist()
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
    expiresAt,
  }
}

export const authHandlers = [
  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as RegisterRequest
    const db = getDb()

    if (db.users.some((u) => u.email === body.email)) {
      return errorResponse('CONFLICT', 'Este e-mail já está cadastrado', 409, {
        email: 'E-mail já em uso',
      })
    }

    const user: UserRecord = {
      id: `u-${crypto.randomUUID()}`,
      name: body.name,
      email: body.email,
      passwordHash: hashPassword(body.password),
      avatarUrl: null,
    }
    db.users.push(user)
    persist()
    mergeVisitorFavorites(request, user.id)
    return HttpResponse.json(buildSession(user), { status: 201 })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest
    const db = getDb()
    const user = db.users.find(
      (u) => u.email === body.email && u.passwordHash === hashPassword(body.password),
    )
    if (!user) {
      return errorResponse('VALIDATION_ERROR', 'Credenciais inválidas', 401, {
        email: 'E-mail ou senha incorretos',
      })
    }
    const session = buildSession(user)
    mergeVisitorCart(request, session.token)
    mergeVisitorFavorites(request, user.id)
    return HttpResponse.json(session)
  }),

  http.get('/api/auth/session', ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return errorResponse('SESSION_INVALID', 'Sessão inválida ou expirada', 401)
    const token = getToken(request)!
    const session = getDb().sessions[token]!
    return HttpResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      expiresAt: session.expiresAt,
    } satisfies Session)
  }),

  http.post('/api/auth/logout', ({ request }) => {
    const token = getToken(request)
    if (token) {
      delete getDb().sessions[token]
      persist()
    }
    return new HttpResponse(null, { status: 204 })
  }),
]
