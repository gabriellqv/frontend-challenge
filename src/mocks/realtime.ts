import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'

import type { OrderStatus } from '@/shared/contracts'
import { REALTIME_URL } from '@/shared/realtime/url'

const realtime = ws.link(REALTIME_URL)

type SocketClient = ReturnType<typeof toSocketIo>['client']
type Connected = { client: SocketClient; close: () => void }

const ENGINE_IO_PING = '2'
const PING_MS = 25_000

let clients: Connected[] = []

function broadcast(event: string, payload: unknown): void {
  clients.forEach((c) => c.client.emit(event, payload))
}

export type NftUpdatedPayload = { nftId: string; version: number; priceEth: string }

/** Emite `nft.updated` (preço/disponibilidade) para todos os clientes. */
export function emitNftUpdated(payload: NftUpdatedPayload): void {
  broadcast('nft.updated', payload)
}

/** Emite `order.updated` (estado do pedido) para todos os clientes. */
export function emitOrderUpdated(orderId: string, status: OrderStatus, version: number): void {
  broadcast('order.updated', { orderId, status, version })
}

export const realtimeHandler = realtime.addEventListener('connection', (connection) => {
  const { client } = toSocketIo(connection)
  const connected: Connected = { client, close: () => connection.client.close() }
  clients.push(connected)

  const pingTimer = window.setInterval(() => connection.client.send(ENGINE_IO_PING), PING_MS)

  connection.client.addEventListener('close', () => {
    window.clearInterval(pingTimer)
    clients = clients.filter((c) => c !== connected)
  })
})
