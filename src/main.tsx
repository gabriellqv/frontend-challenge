import { isMocksEnabled } from './app/env'
import './index.css'

async function bootstrap() {
  // Mocks antes de importar a aplicação: garante que o WebSocket já esteja
  // patcheado antes de o socket.io-client ser carregado.
  if (isMocksEnabled) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
    const { applyUrlControls, exposeControl } = await import('./mocks/scenarios')
    applyUrlControls()
    exposeControl()
  }

  const { mount } = await import('./app/mount')
  mount()
}

void bootstrap()
