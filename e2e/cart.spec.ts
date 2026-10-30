import { expect, test } from '@playwright/test'

test('carrinho: adiciona item pelo detalhe e exibe no carrinho', async ({ page }) => {
  await page.goto('/')

  await page
    .getByRole('link', { name: /Emerald Ape/i })
    .first()
    .click()
  await expect(page.getByRole('heading', { name: /Emerald Ape/i })).toBeVisible({ timeout: 10_000 })

  await page.getByRole('button', { name: 'Comprar' }).click()

  await expect(page).toHaveURL(/\/carrinho/)
  await expect(page.getByText(/Emerald Ape/i).first()).toBeVisible({ timeout: 10_000 })
})
