import { expect, test } from '@playwright/test'

import {
  addToCartAndOpenCart,
  applyScenario,
  confirmPurchase,
  countOrders,
  login,
  prepareCheckout,
} from './support/helpers'

test.describe('compra', () => {
  test('do catálogo ao recibo confirmado, removendo só o que foi comprado', async ({ page }) => {
    await login(page)
    await page.goto('/')
    await page
      .getByRole('link', { name: /Emerald Ape/i })
      .first()
      .click()
    await page
      .locator('button:visible', { hasText: /^(COMPRAR|Comprar NFT)$/ })
      .first()
      .click()
    await expect(page).toHaveURL(/\/carrinho/)

    await prepareCheckout(page)
    await confirmPurchase(page)

    await expect(page).toHaveURL(/\/pedido\//, { timeout: 10_000 })
    await expect(page.getByText('Compra confirmada')).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Transação:/)).toBeVisible()
    await expect(page.getByText('Coinbase Wallet')).toBeVisible()

    await page.goto('/carrinho')
    await expect(
      page.getByText('Seu carrinho está vazio').filter({ visible: true }).first(),
    ).toBeVisible()
  })

  test('carrinho vazio não permite finalizar nem exibe itens fictícios', async ({ page }) => {
    await login(page)
    await page.goto('/pagamento')
    await expect(page.getByRole('heading', { name: 'Seu carrinho está vazio' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toHaveCount(0)
  })

  test('valida os campos do layout antes da revisão', async ({ page, isMobile }) => {
    test.skip(isMobile, 'o formulário do colecionador só existe no layout desktop')
    await login(page)
    await addToCartAndOpenCart(page)
    await page.goto('/pagamento')
    await page.getByRole('button', { name: 'Conectar carteira' }).click()
    await expect(page.getByText('Carteira conectada:')).toBeVisible()

    await page.locator('#email').fill('email-invalido')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    await expect(page.locator('#referralCode')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText(/Informe o código de indicação/)).toBeVisible()
    await expect(page.getByText('Informe um e-mail válido.')).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Revise sua compra' })).toHaveCount(0)
  })

  test('rascunho do checkout sobrevive a refresh', async ({ page, isMobile }) => {
    test.skip(isMobile, 'o formulário do colecionador só existe no desktop')
    await login(page)
    await addToCartAndOpenCart(page)
    await page.goto('/pagamento')

    await page.locator('#displayName').fill('Colecionador Persistente')
    await page.locator('#username').fill('col.persistente')
    await page.locator('#profileName').fill('Perfil Persistente')
    await page.locator('#collectorNote').fill('Este rascunho precisa sobreviver ao refresh.')
    await page.waitForFunction(() =>
      Object.keys(sessionStorage).some((key) => key.startsWith('kurio:checkout-draft:')),
    )

    await page.reload()
    await expect(page.locator('#displayName')).toHaveValue('Colecionador Persistente')
    await expect(page.locator('#username')).toHaveValue('col.persistente')
    await expect(page.locator('#profileName')).toHaveValue('Perfil Persistente')
    await expect(page.locator('#collectorNote')).toHaveValue(
      'Este rascunho precisa sobreviver ao refresh.',
    )
  })

  test('pedido pendente bloqueia uma segunda compra', async ({ page }) => {
    test.setTimeout(60_000)
    await login(page)
    await addToCartAndOpenCart(page)
    await prepareCheckout(page)

    await applyScenario(page, 'payment_pending')
    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    await page.getByRole('button', { name: 'Confirmar e pagar' }).click()

    await expect(page).toHaveURL(/\/pedido\//, { timeout: 10_000 })
    await page.goto('/pagamento')
    await expect(page.getByText(/compra em andamento/i).first()).toBeVisible({
      timeout: 8_000,
    })
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled({
      timeout: 8_000,
    })
    expect(await countOrders(page)).toBe(1)
  })

  test('rascunho não sobrescreve campos do perfil que não foram editados', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'o formulário do colecionador só existe no desktop')
    await login(page)
    await addToCartAndOpenCart(page)
    await page.goto('/pagamento')
    await page.locator('#collectorNote').fill('Observação preservada')
    await page.waitForFunction(() =>
      Object.keys(sessionStorage).some((key) => key.startsWith('kurio:checkout-draft:')),
    )

    await page.goto('/perfil')
    await page.locator('#name').fill('Nova Sato Renomeada')
    await page.getByRole('button', { name: 'Salvar' }).click()
    await expect(page.getByRole('status').filter({ hasText: /Dados atualizados/ })).toBeVisible()

    await page.goto('/pagamento')
    await expect(page.locator('#displayName')).toHaveValue('Nova Sato Renomeada')
    await expect(page.locator('#collectorNote')).toHaveValue('Observação preservada')
  })

  test('carteira recusa a conexão e depois conecta e desconecta', async ({ page }) => {
    await login(page)
    await addToCartAndOpenCart(page)
    await page.goto('/pagamento')

    await applyScenario(page, 'wallet_rejected')
    await page.getByRole('button', { name: 'Conectar carteira' }).click()
    await expect(page.getByText(/A conexão foi recusada/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()

    await applyScenario(page, 'default')
    await page.getByRole('button', { name: 'Conectar carteira' }).click()
    await expect(page.getByText('Carteira conectada:')).toBeVisible()

    await page.getByRole('button', { name: 'Desconectar carteira' }).click()
    await expect(page.getByRole('button', { name: 'Conectar carteira' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar compra' })).toBeDisabled()
  })

  test('carteira desconectada no envio exige reconectar', async ({ page }) => {
    await login(page)
    await addToCartAndOpenCart(page)
    await prepareCheckout(page)

    await applyScenario(page, 'wallet_disconnected')
    await confirmPurchase(page)

    await expect(page.getByRole('alert').filter({ hasText: /desconectada/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Conectar carteira' })).toBeVisible()
    expect(await countOrders(page)).toBe(0)
  })

  test('pagamento recusado mantém os itens no carrinho', async ({ page }) => {
    await login(page)
    await addToCartAndOpenCart(page)
    await prepareCheckout(page)

    await applyScenario(page, 'payment_declined')
    await confirmPurchase(page)

    await expect(page).toHaveURL(/\/pedido\//, { timeout: 10_000 })
    await expect(page.getByText('Pagamento recusado')).toBeVisible({ timeout: 15_000 })

    await page.goto('/carrinho')
    await expect(
      page
        .getByText(/Emerald Ape/i)
        .filter({ visible: true })
        .first(),
    ).toBeVisible()
  })

  test('cliques repetidos geram um único pedido', async ({ page }) => {
    await login(page)
    await addToCartAndOpenCart(page)
    await prepareCheckout(page)

    await page.getByRole('button', { name: 'Confirmar compra' }).click()
    const pay = page.getByRole('button', { name: 'Confirmar e pagar' })
    await pay.click()
    await pay.click({ force: true, timeout: 1000 }).catch(() => undefined)

    await expect(page).toHaveURL(/\/pedido\//, { timeout: 10_000 })
    expect(await countOrders(page)).toBe(1)
  })

  test('timeout após criar o pedido recupera o mesmo pedido', async ({ page }) => {
    // O timeout do cliente (10 s) é nativo do XHR: este teste usa o relógio real.
    test.setTimeout(60_000)
    await login(page)
    await addToCartAndOpenCart(page)
    await prepareCheckout(page)

    await applyScenario(page, 'order_timeout')
    await confirmPurchase(page)

    // A resposta se perde, o cliente reenvia a mesma tentativa e recebe o mesmo pedido.
    await expect(page).toHaveURL(/\/pedido\//, { timeout: 30_000 })
    expect(await countOrders(page)).toBe(1)
  })
})
