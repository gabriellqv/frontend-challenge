import { z } from 'zod'

import { idSchema, isoDateSchema } from './common'

export const profileSchema = z.object({
  id: idSchema,
  name: z.string().min(2),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
})
export type Profile = z.infer<typeof profileSchema>

export const updateProfileRequestSchema = z.object({
  name: z.string().min(2),
  avatarUrl: z.string().nullable().optional(),
})
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>

/** Provedores de carteira (conexão simulada no checkout). */
export const walletProviderSchema = z.enum(['walletconnect', 'metamask', 'coinbase'])
export type WalletProvider = z.infer<typeof walletProviderSchema>

export const walletSchema = z.object({
  id: idSchema,
  address: z.string().min(1),
  network: z.string().min(1),
  label: z.string().nullable(),
  isPrimary: z.boolean(),
  /** Tipo de carteira escolhido no cadastro. */
  provider: walletProviderSchema.nullable(),
  /** Nome ENS completo (ex.: `nova.eth`). */
  ensName: z.string().nullable(),
  referralCode: z.string().nullable(),
})
export type Wallet = z.infer<typeof walletSchema>

/** Endereço completo: `0x` + 40 hexadecimais. */
export const walletAddressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Informe um endereço 0x com 40 caracteres hexadecimais.')

export const createWalletRequestSchema = z.object({
  address: walletAddressSchema,
  network: z.string().min(1),
  label: z.string().trim().min(2).nullable(),
  provider: walletProviderSchema,
  ensName: z.string().nullable(),
  referralCode: z.string().nullable(),
  /** Cadastrar já como principal (a anterior vira secundária). */
  isPrimary: z.boolean().optional(),
})
export type CreateWalletRequest = z.infer<typeof createWalletRequestSchema>

export const updateWalletRequestSchema = createWalletRequestSchema.partial()
export type UpdateWalletRequest = z.infer<typeof updateWalletRequestSchema>

export const favoriteSchema = z.object({
  nftId: idSchema,
  addedAt: isoDateSchema,
})
export type Favorite = z.infer<typeof favoriteSchema>

export const connectWalletRequestSchema = z.object({
  provider: walletProviderSchema,
  network: z.string().min(1),
})
export type ConnectWalletRequest = z.infer<typeof connectWalletRequestSchema>

/**
 * Conexão simulada de uma carteira cadastrada. Vive só na sessão do mock:
 * recarregar a página ou o cenário `wallet_disconnected` encerra a conexão.
 */
export const walletConnectionSchema = z.object({
  connectionId: idSchema,
  walletId: idSchema,
  address: z.string().min(1),
  network: z.string().min(1),
  provider: walletProviderSchema,
})
export type WalletConnection = z.infer<typeof walletConnectionSchema>
