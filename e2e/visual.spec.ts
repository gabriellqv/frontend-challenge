import { expect, test } from '@playwright/test'

test.describe('regressão visual', () => {
  test('início: catálogo e destaques', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: /Emerald Ape/i }).first()).toBeVisible({
      timeout: 10_000,
    })
    await expect(page).toHaveScreenshot('inicio.png', { maxDiffPixelRatio: 0.05 })
  })

  test('detalhes do nft: galeria e informações', async ({ page }) => {
    await page.goto('/nft/nft-1')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveScreenshot('detalhe.png', { maxDiffPixelRatio: 0.05 })
  })

  test('carrinho: tabela de itens e resumo', async ({ page }) => {
    await page.goto('/carrinho')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10_000 })
    await expect(page).toHaveScreenshot('carrinho.png', { maxDiffPixelRatio: 0.05 })
  })

  test('pagamento: dados do colecionador e revisão', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('nova@kurio.test')
    await page.getByLabel('Senha').fill('kurio123')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/\/(\?.*)?$/)

    await page.goto('/pagamento')
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page).toHaveScreenshot('pagamento.png', { maxDiffPixelRatio: 0.05 })
  })
})
