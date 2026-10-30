import { expect, test } from '@playwright/test'

test('conta: login exibe o usuário no header e logout limpa a sessão', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('nova@kurio.test')
  await page.getByLabel('Senha').fill('kurio123')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByText('Nova Sato').first()).toBeVisible({ timeout: 10_000 })

  await page.getByRole('button', { name: 'Sair' }).first().click()
  await expect(page.getByRole('link', { name: 'Entrar' }).first()).toBeVisible()
})

test('carrinho: preserva itens do visitante ao autenticar', async ({ page }) => {
  await page.goto('/')
  await page
    .getByRole('link', { name: /Emerald Ape/i })
    .first()
    .click()
  await page.getByRole('button', { name: 'Comprar' }).click()
  await expect(page).toHaveURL(/\/carrinho/)
  await expect(page.getByText(/Emerald Ape/i).first()).toBeVisible()

  await page.goto('/login')
  await page.getByLabel('E-mail').fill('nova@kurio.test')
  await page.getByLabel('Senha').fill('kurio123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('Nova Sato').first()).toBeVisible({ timeout: 10_000 })

  await page.goto('/carrinho')
  await expect(page.getByText(/Emerald Ape/i).first()).toBeVisible({ timeout: 10_000 })
})
