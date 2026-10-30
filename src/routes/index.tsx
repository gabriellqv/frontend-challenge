import { useEffect, useState } from 'react'

import { createFileRoute } from '@tanstack/react-router'

import { type NftUpdatedEvent, connectRealtime } from '@/shared/realtime/client'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [status, setStatus] = useState('conectando…')
  const [event, setEvent] = useState<NftUpdatedEvent | null>(null)

  useEffect(() => {
    const socket = connectRealtime(setEvent)
    socket.on('connect', () => setStatus('conectado'))
    socket.on('connect_error', (err) => setStatus(`erro: ${err.message}`))
    return () => {
      socket.close()
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-foreground text-ink">
      <p className="font-mono text-lg text-primary">Kurio — Início</p>
      <div data-testid="realtime-status" className="font-mono text-sm">
        {status}
      </div>
      <div data-testid="realtime-event" className="font-mono">
        {event
          ? `nft.updated: ${event.nftId} v${event.version} @ ${event.priceEth} ETH`
          : 'aguardando evento…'}
      </div>
    </main>
  )
}
