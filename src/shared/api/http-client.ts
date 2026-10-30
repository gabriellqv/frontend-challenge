import axios, { AxiosError, type AxiosRequestConfig } from 'axios'
import { type ZodType } from 'zod'

import { errorEnvelopeSchema } from '@/shared/contracts'
import { getToken, getVisitorId } from '@/shared/session'

const API_URL = import.meta.env.VITE_API_URL || '/api'

/** Erro normalizado da API — único formato que o código de UI enxerga. */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fields: Record<string, string> | undefined
  readonly retryable: boolean

  constructor(init: {
    status: number
    code: string
    message: string
    fields?: Record<string, string> | undefined
    retryable?: boolean | undefined
  }) {
    super(init.message)
    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.fields = init.fields
    this.retryable = init.retryable ?? false
  }
}

/** Instância única do Axios — todo tráfego REST passa por aqui. */
export const httpClient = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
})

httpClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers['X-Cart-Id'] = getVisitorId()
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const parsed = errorEnvelopeSchema.safeParse(error.response.data)
      if (parsed.success) {
        throw new ApiError({ status: error.response.status, ...parsed.data.error })
      }
      throw new ApiError({
        status: error.response.status,
        code: 'NETWORK_ERROR',
        message: 'Resposta inesperada da API',
      })
    }
    if (error.code === 'ECONNABORTED') {
      throw new ApiError({
        status: 0,
        code: 'TIMEOUT',
        message: 'Tempo esgotado',
        retryable: true,
      })
    }
    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Falha de conexão',
      retryable: true,
    })
  },
)

/** GET tipado: valida a resposta contra o schema zod. */
export async function getJson<T>(
  schema: ZodType<T>,
  path: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await httpClient.get(path, config)
  return schema.parse(res.data)
}

/** POST tipado: valida a resposta contra o schema zod. */
export async function postJson<T>(
  schema: ZodType<T>,
  path: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await httpClient.post(path, body, config)
  return schema.parse(res.data)
}
