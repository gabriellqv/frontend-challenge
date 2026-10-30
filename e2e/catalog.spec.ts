import { expect, test } from '@playwright/test'

test('início: carrega o catálogo com os mocks', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Explorar NFTs' })).toBeVisible()

  // Aguarda os NFTs do mock aparecerem (após o loading/skeleton).
  await expect(page.getByRole('link', { name: /Emerald Ape/i }).first()).toBeVisible({
    timeout: 10_000,
  })
})
