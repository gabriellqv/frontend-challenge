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

test('carrinho mobile: modo de exclusão e exclusão de itens', async ({ page }) => {
  await page.setViewportSize({ width: 414, height: 896 })
  await page.goto('/nft/nft-1')
  await page.getByRole('button', { name: 'Comprar NFT' }).first().click()
  await expect(page).toHaveURL(/\/carrinho/)
  await expect(page.locator('.md\\:hidden').getByText(/Emerald Ape/i)).toBeVisible({
    timeout: 10_000,
  })

  // Ativar modo de exclusão
  const toggleBtn = page.getByRole('button', { name: /Ativar modo de exclusão|Excluir/i }).first()
  await expect(toggleBtn).toBeVisible()
  await toggleBtn.click()

  await expect(page.getByText('Modo de exclusão ativo')).toBeVisible()
  const deleteBtn = page.getByRole('button', { name: /Excluir Emerald Ape/i }).first()
  await expect(deleteBtn).toBeVisible()
  await deleteBtn.click()

  await expect(page.getByText('Seu carrinho está vazio').filter({ visible: true })).toBeVisible({
    timeout: 10_000,
  })
})
