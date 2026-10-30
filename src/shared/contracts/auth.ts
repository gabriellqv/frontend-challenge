import { z } from 'zod';

import { idSchema, isoDateSchema } from './common';

export const userSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().nullable(),
});
export type User = z.infer<typeof userSchema>;

export const sessionSchema = z.object({
  token: z.string().min(1),
  user: userSchema,
  expiresAt: isoDateSchema,
});
export type Session = z.infer<typeof sessionSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const registerRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
