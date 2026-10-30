import { z } from 'zod';

import { idSchema, isoDateSchema } from './common';

export const profileSchema = z.object({
  id: idSchema,
  name: z.string().min(2),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
});
export type Profile = z.infer<typeof profileSchema>;

export const updateProfileRequestSchema = z.object({
  name: z.string().min(2),
  avatarUrl: z.string().nullable().optional(),
});
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

export const walletSchema = z.object({
  id: idSchema,
  address: z.string().min(1),
  network: z.string().min(1),
  label: z.string().nullable(),
  isPrimary: z.boolean(),
});
export type Wallet = z.infer<typeof walletSchema>;

export const createWalletRequestSchema = z.object({
  address: z.string().min(1),
  network: z.string().min(1),
  label: z.string().nullable().optional(),
});
export type CreateWalletRequest = z.infer<typeof createWalletRequestSchema>;

export const favoriteSchema = z.object({
  nftId: idSchema,
  addedAt: isoDateSchema,
});
export type Favorite = z.infer<typeof favoriteSchema>;
