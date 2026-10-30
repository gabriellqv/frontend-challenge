import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { io } from 'socket.io-client'

import { queryKeys } from '@/shared/api/query-keys'
import { getOwnerKey } from '@/shared/session'

import { REALTIME_URL } from './url'

type OrderUpdatedEvent = { orderId: string; status: string; version: number }

/**
 * Mantém o cache sincronizado com os eventos de tempo real. Ao receber
 * `nft.updated`/`order.updated`, invalida as queries afetadas para reconciliar
 * com a API REST (fonte de verdade).
 */
export function useRealtimeUpdates(): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = io(REALTIME_URL, { transports: ['websocket'] })

    socket.on('nft.updated', () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.nfts.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all(getOwnerKey()) })
    })

    socket.on('order.updated', (event: OrderUpdatedEvent) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders.detail(getOwnerKey(), event.orderId),
      })
    })

    return () => {
      socket.close()
    }
  }, [queryClient])
}
