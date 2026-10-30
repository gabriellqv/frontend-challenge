import { getDb, persist, resetDb } from './db'
import { emitNftUpdated } from './realtime'

export type ScenarioName =
  'default' | 'empty' | 'slow' | 'offline' | 'server_error' | 'price_changed' | 'payment_declined'

let latencyMs = 0
let offline = false
let paymentDeclined = false

/** Latência simulada (ms) aplicada às respostas REST. */
export function getLatencyMs(): number {
  return latencyMs
}

/** Indisponibilidade de conexão simulada. */
export function isOffline(): boolean {
  return offline
}

/** Pagamento simulado como recusado (cenário). */
export function isPaymentDeclined(): boolean {
  return paymentDeclined
}

export function applyScenario(name: string | null): void {
  latencyMs = 0
  offline = false
  paymentDeclined = false

  switch (name) {
    case 'empty':
      getDb().nfts = []
      persist()
      break
    case 'slow':
      latencyMs = 2500
      break
    case 'offline':
      offline = true
      break
    case 'payment_declined':
      paymentDeclined = true
      break
    case 'price_changed': {
      const nft = getDb().nfts[0]
      if (nft) {
        nft.priceEth = '2.99'
        nft.version += 1
        persist()
        emitNftUpdated({ nftId: nft.id, version: nft.version, priceEth: nft.priceEth })
      }
      break
    }
    default:
      break
  }
}

export function parseScenarioFromUrl(): { scenario: string | null; reset: boolean } {
  const url = new URL(window.location.href)
  return {
    scenario: url.searchParams.get('scenario'),
    reset: url.searchParams.get('reset') === '1',
  }
}

export function applyUrlControls(): void {
  const { scenario, reset } = parseScenarioFromUrl()
  if (reset) resetDb()
  applyScenario(scenario)
}

declare global {
  interface Window {
    __kurio?: {
      reset: typeof resetDb
      applyScenario: typeof applyScenario
      emitNftUpdated: typeof emitNftUpdated
    }
  }
}

/** API de controle exposta em `window.__kurio` para os testes E2E. */
export function exposeControl(): void {
  window.__kurio = {
    reset: resetDb,
    applyScenario,
    emitNftUpdated,
  }
}
