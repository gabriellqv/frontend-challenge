import { type Socket, io } from 'socket.io-client'

import { REALTIME_URL } from './url'

export type NftUpdatedEvent = {
  nftId: string
  version: number
  priceEth: string
}

/**
 * Conexão de tempo real (socket.io-client). Transporte websocket apenas,
 * já que o MSW intercepta a conexão no navegador.
 */
export function connectRealtime(onNftUpdated: (event: NftUpdatedEvent) => void): Socket {
  const socket = io(REALTIME_URL, { transports: ['websocket'] })

  socket.on('nft.updated', (event: NftUpdatedEvent) => {
    onNftUpdated(event)
  })

  return socket
}
