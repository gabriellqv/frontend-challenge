import type { Cart, Nft, Order, Wallet } from '@/shared/contracts'

import { createNfts, createUserRecords, seedWallets } from './fixtures'

const DB_KEY = 'kurio:mock-db'

export type UserRecord = {
  id: string
  name: string
  email: string
  passwordHash: string
  avatarUrl: string | null
}

export type SessionRecord = {
  token: string
  userId: string
  expiresAt: string
}

export type Db = {
  nfts: Nft[]
  users: UserRecord[]
  /** userId -> lista de nftIds favoritados. */
  favorites: Record<string, string[]>
  /** ownerKey -> carrinho. */
  carts: Record<string, Cart>
  /** orderId -> pedido (snapshot imutável). */
  orders: Record<string, Order>
  /** userId -> carteiras. */
  wallets: Record<string, Wallet[]>
  /** token -> sessão. */
  sessions: Record<string, SessionRecord>
  /** idempotencyKey -> orderId (recuperação de pedido idempotente). */
  idempotency: Record<string, string>
}

/**
 * Hash simples e determinístico para o mock (NÃO é criptográfico).
 * Existe apenas para nunca armazenar senha em claro, conforme o enunciado.
 */
export function hashPassword(password: string): string {
  const salted = `kurio:${password}`
  let h = 5381
  for (let i = 0; i < salted.length; i++) {
    h = ((h << 5) + h + salted.charCodeAt(i)) | 0
  }
  return `h${(h >>> 0).toString(16)}`
}

function seed(): Db {
  return {
    nfts: createNfts(),
    users: createUserRecords(),
    favorites: {},
    carts: {},
    orders: {},
    wallets: seedWallets(),
    sessions: {},
    idempotency: {},
  }
}

function load(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Db
      if (
        parsed &&
        Array.isArray(parsed.nfts) &&
        parsed.nfts.length > 0 &&
        typeof parsed.nfts[0]?.priceEth === 'string' &&
        typeof parsed.nfts[0]?.imageUrl === 'string'
      ) {
        const imageFixes: Record<string, string> = {
          'nft-1': '/images/Frame-136.png',
          'nft-19': '/images/NFT-Artwork-18.png',
          'nft-20': '/images/NFT-Artwork-18.png',
          'nft-21': '/images/NFT-Artwork-05.png',
          'nft-22': '/images/NFT-Artwork-09.png',
          'nft-23': '/images/NFT-Artwork-09.png',
        }
        let changed = false
        for (const [id, url] of Object.entries(imageFixes)) {
          const item = parsed.nfts.find((n) => n.id === id)
          if (item && item.imageUrl !== url) {
            item.imageUrl = url
            changed = true
          }
        }
        if (changed) {
          persistRaw(parsed)
        }
        return parsed
      }
    }
  } catch {
    /* ignora e re-seeda */
  }
  const fresh = seed()
  persistRaw(fresh)
  return fresh
}

function persistRaw(d: Db): void {
  localStorage.setItem(DB_KEY, JSON.stringify(d))
}

let db: Db = load()

export function getDb(): Db {
  return db
}

export function persist(): void {
  persistRaw(db)
}

/** Restaura integralmente o cenário conhecido (seed). */
export function resetDb(): Db {
  db = seed()
  persistRaw(db)
  return db
}
