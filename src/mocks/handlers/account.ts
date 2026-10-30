import { HttpResponse, http } from 'msw'

import type {
  ChangePasswordRequest,
  CreateWalletRequest,
  Profile,
  UpdateProfileRequest,
  Wallet,
} from '@/shared/contracts'

import { getDb, hashPassword, persist } from '../db'
import { errorResponse, getAuthenticatedUser, unauthorized } from '../utils'

type UpdateWalletRequest = Partial<Pick<Wallet, 'address' | 'network' | 'label' | 'isPrimary'>>

export const accountHandlers = [
  http.get('/api/profile', ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return unauthorized()

    const profile: Profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    }
    return HttpResponse.json(profile)
  }),

  http.patch('/api/profile', async ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return unauthorized()

    const body = (await request.json()) as UpdateProfileRequest
    if (!body.name || body.name.length < 2) {
      return errorResponse('VALIDATION_ERROR', 'Nome deve ter ao menos 2 caracteres', 422, {
        name: 'Mínimo de 2 caracteres',
      })
    }

    user.name = body.name
    if (body.avatarUrl !== undefined) user.avatarUrl = body.avatarUrl
    persist()

    const profile: Profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    }
    return HttpResponse.json(profile)
  }),

  http.post('/api/profile/password', async ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return unauthorized()

    const body = (await request.json()) as ChangePasswordRequest
    if (hashPassword(body.currentPassword) !== user.passwordHash) {
      return errorResponse('VALIDATION_ERROR', 'Senha atual incorreta', 422, {
        currentPassword: 'Senha atual incorreta',
      })
    }
    if (!body.newPassword || body.newPassword.length < 6) {
      return errorResponse('VALIDATION_ERROR', 'A nova senha deve ter ao menos 6 caracteres', 422, {
        newPassword: 'Mínimo de 6 caracteres',
      })
    }

    user.passwordHash = hashPassword(body.newPassword)
    persist()
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/wallets', ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return unauthorized()
    return HttpResponse.json(getDb().wallets[user.id] ?? [])
  }),

  http.post('/api/wallets', async ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return unauthorized()

    const body = (await request.json()) as CreateWalletRequest
    const db = getDb()
    const wallets = db.wallets[user.id] ?? []

    const wallet: Wallet = {
      id: `w-${crypto.randomUUID()}`,
      address: body.address,
      network: body.network,
      label: body.label ?? null,
      isPrimary: wallets.length === 0,
    }
    wallets.push(wallet)
    db.wallets[user.id] = wallets
    persist()
    return HttpResponse.json(wallet)
  }),

  http.patch('/api/wallets/:id', async ({ request, params }) => {
    const user = getAuthenticatedUser(request)
    if (!user) return unauthorized()

    const body = (await request.json()) as UpdateWalletRequest
    const db = getDb()
    const wallets = db.wallets[user.id] ?? []
    const wallet = wallets.find((w) => w.id === params.id)
    if (!wallet) return errorResponse('NOT_FOUND', 'Carteira não encontrada', 404)

    if (body.address !== undefined) wallet.address = body.address
    if (body.network !== undefined) wallet.network = body.network
    if (body.label !== undefined) wallet.label = body.label
    if (body.isPrimary === true) {
      for (const w of wallets) w.isPrimary = false
      wallet.isPrimary = true
    }

    db.wallets[user.id] = wallets
    persist()
    return HttpResponse.json(wallet)
  }),
]
