import { expect, test } from '@playwright/test'

test.describe.serial('compra completa', () => {
  test('do catálogo ao recibo confirmado', async ({ page }) => {
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

    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    await expect(page).toHaveURL(/\/pedido\//, { timeout: 10_000 })
    await expect(page.getByText('Compra confirmada')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Transação:/)).toBeVisible()
  })
})
