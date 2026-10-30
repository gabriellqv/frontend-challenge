import { expect, test } from '@playwright/test'

test('carregamento lento exibe skeleton e depois os dados', async ({ page }) => {
  await page.goto('/?scenario=slow')

  await expect(page.getByRole('status', { name: /Carregando/i }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /Emerald Ape/i }).first()).toBeVisible({
    timeout: 10_000,
  })
})

test('falha de conexão exibe erro e recupera com nova tentativa', async ({ page }) => {
  await page.goto('/?scenario=offline')

  await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 })

  await page.evaluate(() => window.__kurio!.applyScenario('default'))
  await page.getByRole('button', { name: 'Tentar novamente' }).click()

  await expect(page.getByRole('link', { name: /Emerald Ape/i }).first()).toBeVisible({
    timeout: 10_000,
  })
})

test('pagamento recusado exibe o resultado', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('nova@kurio.test')
  await page.getByLabel('Senha').fill('kurio123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('Nova Sato').first()).toBeVisible({ timeout: 10_000 })

  await page.goto('/')
  await page
    .getByRole('link', { name: /Emerald Ape/i })
    .first()
    .click()
  await page.getByRole('button', { name: 'Comprar' }).click()
  await expect(page).toHaveURL(/\/carrinho/)
  await page.getByRole('link', { name: 'Finalizar compra' }).click()
  await expect(page).toHaveURL(/\/pagamento/)

  await page.evaluate(() => window.__kurio!.applyScenario('payment_declined'))
  await page.getByRole('button', { name: 'Confirmar compra' }).click()

  await expect(page).toHaveURL(/\/pedido\//, { timeout: 10_000 })
  await expect(page.getByText('Pagamento recusado')).toBeVisible({ timeout: 15_000 })
})
