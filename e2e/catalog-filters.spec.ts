import { expect, test } from '@playwright/test'

test('catálogo: busca, filtros combinados e ordenação refletem na URL', async ({ page }) => {
  await page.goto('/')

  await page.getByPlaceholder('Buscar NFTs').fill('ape')
  await page.waitForURL(/q=ape/)
  await expect(page.getByRole('link', { name: /Emerald Ape/i }).first()).toBeVisible()

  await page.getByRole('radio', { name: 'Kurio Apes' }).check()
  await page.waitForURL(/collection=/)

  await page.getByLabel('Ordenar por').selectOption('price_asc')
  await page.waitForURL(/sort=price_asc/)

  await page.reload()
  await expect(page.getByPlaceholder('Buscar NFTs')).toHaveValue('ape')
  await expect(page.getByLabel('Ordenar por')).toHaveValue('price_asc')
})

test('catálogo: paginação altera a URL e o histórico restaura', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Próxima' }).click()
  await page.waitForURL(/page=2/)

  await page.goBack()
  await expect(page).toHaveURL(/page=1|^\/(\?.*)?$/)
})

test('detalhe: acesso direto e NFT inexistente', async ({ page }) => {
  await page.goto('/nft/nft-1')
  await expect(page.getByRole('heading', { name: /Emerald Ape/i })).toBeVisible({ timeout: 10_000 })

  await page.goto('/nft/nao-existe')
  await expect(page.getByText('NFT não encontrado')).toBeVisible({ timeout: 10_000 })
})

test('mobile: trava scroll do body quando menu de filtros estiver aberto', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('/')

  const initialOverflow = await page.evaluate(() => document.body.style.overflow)
  expect(initialOverflow).not.toBe('hidden')

  await page.getByLabel('Abrir filtros').click()
  await expect(page.getByRole('dialog', { name: 'Filtros de coleções e redes' })).toBeVisible()

  const lockedOverflow = await page.evaluate(() => document.body.style.overflow)
  expect(lockedOverflow).toBe('hidden')

  await page.getByLabel('Fechar filtros').click()
  await expect(page.getByRole('dialog', { name: 'Filtros de coleções e redes' })).not.toBeVisible()

  const restoredOverflow = await page.evaluate(() => document.body.style.overflow)
  expect(restoredOverflow).toBe(initialOverflow)
})
