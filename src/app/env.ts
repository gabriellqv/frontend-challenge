import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().default('/api'),
  VITE_SOCKET_URL: z.string().default(''),
  VITE_ENABLE_MOCKS: z.string().default('true'),
});

const parsed = envSchema.safeParse(import.meta.env);
if (!parsed.success) {
  throw new Error(
    `Variáveis de ambiente inválidas: ${JSON.stringify(parsed.error.format(), null, 2)}`,
  );
}

export const env = parsed.data;

/** Mocks (MSW) ativados por configuração — também no build de demonstração. */
export const isMocksEnabled = env.VITE_ENABLE_MOCKS === 'true';
