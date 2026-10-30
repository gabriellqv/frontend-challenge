import { z } from 'zod'

import { ethSchema, idSchema, paginationSchema } from './common'

export const networkSchema = z.enum(['Ethereum', 'Polygon', 'Solana'])
export type Network = z.infer<typeof networkSchema>

/**
 * Edição de um NFT. Cada edição tem estoque próprio.
 * `totalSupply === null` representa uma edição aberta ("ABERTA").
 */
export const editionSchema = z.object({
  id: idSchema,
  name: z.string(),
  totalSupply: z.number().int().min(1).nullable(),
  available: z.number().int().min(0),
})
export type Edition = z.infer<typeof editionSchema>

export const creatorSchema = z.object({
  name: z.string(),
  address: z.string(),
})
export type Creator = z.infer<typeof creatorSchema>

export const nftSchema = z.object({
  id: idSchema,
  name: z.string(),
  description: z.string(),
  collection: z.string(),
  network: networkSchema,
  priceEth: ethSchema,
  imageUrl: z.string(),
  creator: creatorSchema,
  editions: z.array(editionSchema),
  /** Versão crescente, usada para ordenar eventos em tempo real. */
  version: z.number().int().min(0),
})
export type Nft = z.infer<typeof nftSchema>

export const nftSortSchema = z.enum(['newest', 'price_asc', 'price_desc'])
export type NftSort = z.infer<typeof nftSortSchema>

/** Parâmetros de listagem — compõem a URL (busca/filtros/ordenação/paginação). */
export const nftListQuerySchema = z.object({
  q: z.string().optional(),
  collection: z.string().optional(),
  network: networkSchema.optional(),
  priceMin: ethSchema.optional(),
  priceMax: ethSchema.optional(),
  sort: nftSortSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
})
export type NftListQuery = z.infer<typeof nftListQuerySchema>

export const nftPageSchema = z.object({
  items: z.array(nftSchema),
  pagination: paginationSchema,
})
export type NftPage = z.infer<typeof nftPageSchema>
