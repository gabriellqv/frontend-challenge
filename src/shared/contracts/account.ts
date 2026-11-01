import { z } from 'zod'

import { idSchema, isoDateSchema } from './common'

/** Nome de usuário público, usado no perfil e no checkout. */
export const usernameSchema = z
  .string({ error: 'Nome de usuário é obrigatório' })
  .trim()
  .min(3, 'Use de 3 a 20 caracteres')
  .max(20, 'Use de 3 a 20 caracteres')
  .regex(/^[a-z0-9._]+$/, 'Use apenas letras minúsculas, números, ponto ou _')

export const profileSchema = z.object({
  id: idSchema,
  name: z.string().min(2),
  username: usernameSchema,
  email: z.string().email(),
  /** Nome ENS completo (ex.: `nova.eth`), opcional. */
  ensName: z.string().nullable(),
  /** Apelido da carteira principal exibido no perfil. */
  walletNickname: z.string().nullable(),
  avatarUrl: z.string().nullable(),
})
export type Profile = z.infer<typeof profileSchema>

export const updateProfileRequestSchema = z.object({
  name: z
    .string({ error: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .min(2, 'Nome deve ter no mínimo 2 caracteres'),
  username: usernameSchema,
  email: z.string({ error: 'E-mail é obrigatório' }).email('E-mail inválido'),
  ensName: z.string().trim().max(60, 'Use no máximo 60 caracteres').nullable().optional(),
  walletNickname: z.string().trim().max(40, 'Use no máximo 40 caracteres').nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
})
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>

export const changePasswordRequestSchema = z.object({
  currentPassword: z
    .string({ error: 'Senha atual é obrigatória' })
    .min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string({ error: 'Nova senha é obrigatória' })
    .min(1, 'Nova senha é obrigatória')
    .min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
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
  network: z.string({ error: 'Rede é obrigatória' }).min(1, 'Rede é obrigatória'),
  label: z
    .string({ error: 'Informe um apelido para a carteira' })
    .trim()
    .min(2, 'Apelido deve ter no mínimo 2 caracteres')
    .nullable(),
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
