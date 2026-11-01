import { z } from 'zod'

import { type CollectorForm, collectorFormSchema } from './checkout-form'

const DRAFT_PREFIX = 'kurio:checkout-draft:'
const PREFS_PREFIX = 'kurio:checkout-prefs:'

const draftSchema = collectorFormSchema.partial()
const prefsSchema = z.object({
  walletId: z.string().nullable().optional(),
  network: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
})

export type CheckoutPrefs = z.infer<typeof prefsSchema>

function key(prefix: string, ownerKey: string): string {
  return `${prefix}${ownerKey}`
}

/** Rascunho do formulário do colecionador, por dono e por aba. */
export function readCheckoutDraft(ownerKey: string): Partial<CollectorForm> | null {
  try {
    const raw = sessionStorage.getItem(key(DRAFT_PREFIX, ownerKey))
    if (!raw) return null
    const parsed = draftSchema.safeParse(JSON.parse(raw))
    return parsed.success ? (parsed.data as Partial<CollectorForm>) : null
  } catch {
    return null
  }
}

export function writeCheckoutDraft(ownerKey: string, draft: Partial<CollectorForm>): void {
  try {
    sessionStorage.setItem(key(DRAFT_PREFIX, ownerKey), JSON.stringify(draft))
  } catch {
    // Sem storage o formulário continua funcionando só nesta página.
  }
}

export function clearCheckoutDraft(ownerKey: string): void {
  sessionStorage.removeItem(key(DRAFT_PREFIX, ownerKey))
}

/** Preferências de pagamento (carteira, rede e provedor) por dono. */
export function readCheckoutPrefs(ownerKey: string): CheckoutPrefs {
  try {
    const raw = sessionStorage.getItem(key(PREFS_PREFIX, ownerKey))
    if (!raw) return {}
    const parsed = prefsSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : {}
  } catch {
    return {}
  }
}

export function writeCheckoutPrefs(ownerKey: string, prefs: CheckoutPrefs): void {
  try {
    sessionStorage.setItem(key(PREFS_PREFIX, ownerKey), JSON.stringify(prefs))
  } catch {
    // idem
  }
}

export function clearCheckoutPrefs(ownerKey: string): void {
  sessionStorage.removeItem(key(PREFS_PREFIX, ownerKey))
}
