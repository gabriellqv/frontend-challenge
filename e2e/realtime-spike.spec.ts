import { expect, test } from '@playwright/test'

test('tempo real: cliente socket.io recebe nft.updated via MSW', async ({ page }) => {
  await page.goto('/')

  const statusEl = page.getByTestId('realtime-status')
  await expect(statusEl).toContainText('conectado', { timeout: 10_000 })

  await page.evaluate(() => {
    window.__kurio!.emitNftUpdated({ nftId: 'nft-1', version: 2, priceEth: '1.5' })
  })

  const eventEl = page.getByTestId('realtime-event')
  await expect(eventEl).toContainText('nft.updated: nft-1 v2 @ 1.5 ETH', { timeout: 5_000 })
})
