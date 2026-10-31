import { expect, test } from '@playwright/test'

test('início: carrega o catálogo com os mocks', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /SEJA DONO DO FUTURO/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Emerald Ape/i }).first()).toBeVisible({
    timeout: 10_000,
  })
})
