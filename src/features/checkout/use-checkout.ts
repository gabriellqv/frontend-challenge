import { useEffect, useState } from 'react'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { z } from 'zod'

import {
  profileQueryOptions,
  useConnectWallet,
  useDisconnectWallet,
  walletsQueryOptions,
} from '@/features/account/api'
import { cartQueryOptions, quoteQueryOptions } from '@/features/cart/api'
import { readStoredCoupon, storeCoupon } from '@/features/cart/coupon-storage'
import { pendingOrdersQueryOptions, useCreateOrder } from '@/features/orders/api'
import { ApiError } from '@/shared/api/http-client'
import { queryKeys } from '@/shared/api/query-keys'
import {
  type Network,
  type Wallet,
  type WalletConnection,
  type WalletProvider,
  networkSchema,
  walletProviderSchema,
} from '@/shared/contracts'
import { createIdempotencyKey } from '@/shared/lib/hash'
import { getOwnerKey } from '@/shared/session'

import {
  clearCheckoutDraft,
  clearCheckoutPrefs,
  readCheckoutPrefs,
  writeCheckoutPrefs,
} from './draft'

const attemptSchema = z.object({ key: z.string().min(1), body: z.unknown() })
type Attempt = z.infer<typeof attemptSchema>

/** Compara a intenção de compra sem a identidade efêmera da cotação. */
function comparableBody(body: unknown): unknown {
  if (typeof body !== 'object' || body === null) return body
  const copy = { ...(body as Record<string, unknown>) }
  delete copy.quoteId
  return copy
}

function attemptKey(ownerKey: string): string {
  return `kurio:checkout-attempt:${ownerKey}`
}

function readAttempt(ownerKey: string): Attempt | null {
  try {
    const raw = sessionStorage.getItem(attemptKey(ownerKey))
    if (!raw) return null
    const parsed = attemptSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}

function writeAttempt(ownerKey: string, attempt: Attempt | null): void {
  if (attempt) sessionStorage.setItem(attemptKey(ownerKey), JSON.stringify(attempt))
  else sessionStorage.removeItem(attemptKey(ownerKey))
}

function toNetwork(value: string | undefined): Network {
  const parsed = networkSchema.safeParse(value)
  return parsed.success ? parsed.data : 'Ethereum'
}

export type WalletConnectionStatus = 'idle' | 'connecting' | 'connected' | 'rejected'

const ORDER_ERROR_MESSAGES: Partial<Record<string, string>> = {
  TIMEOUT:
    'Não recebemos a confirmação a tempo. Tente novamente: a mesma tentativa não gera outra compra.',
  NETWORK_ERROR: 'Falha de conexão. Tente novamente: a mesma tentativa não gera outra compra.',
}

/**
 * Estado e ações do checkout, compartilhados pelos layouts desktop e mobile.
 *
 * - Itens e totais vêm do carrinho e da cotação da API (referência do pedido).
 * - O total revisado só muda com aceite explícito: alterações de preço,
 *   estoque ou taxa exigem nova confirmação antes de enviar.
 * - Só carteiras cadastradas, conectadas pela simulação de carteira.
 * - Envio idempotente: cliques repetidos e reenvios após timeout recuperam o
 *   mesmo pedido.
 *
 * @returns Dados, estados derivados e ações do checkout.
 */
export function useCheckout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const ownerKey = getOwnerKey()
  const prefs = readCheckoutPrefs(ownerKey)

  const cartQuery = useQuery(cartQueryOptions())
  const walletsQuery = useQuery(walletsQueryOptions())
  const profileQuery = useQuery(profileQueryOptions())
  const pendingOrders = useQuery(pendingOrdersQueryOptions())
  const createOrder = useCreateOrder()
  const connectWallet = useConnectWallet()
  const disconnectWallet = useDisconnectWallet()

  const [chosenWalletId, setChosenWalletId] = useState<string | null>(prefs.walletId ?? null)
  const [chosenNetwork, setChosenNetwork] = useState<Network | null>(
    prefs.network ? toNetwork(prefs.network) : null,
  )
  const [provider, setProvider] = useState<WalletProvider>(() => {
    const parsed = walletProviderSchema.safeParse(prefs.provider)
    return parsed.success ? parsed.data : 'coinbase'
  })
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState(readStoredCoupon)
  const [acceptedTotal, setAcceptedTotal] = useState<string | null>(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)

  const pendingOrder = pendingOrders.data?.items[0] ?? null

  useEffect(() => {
    writeCheckoutPrefs(ownerKey, { walletId: chosenWalletId, network: chosenNetwork, provider })
  }, [ownerKey, chosenWalletId, chosenNetwork, provider])

  const items = cartQuery.data?.items ?? []
  const wallets: Wallet[] = walletsQuery.data ?? []
  const selectedWallet =
    wallets.find((w) => w.id === chosenWalletId) ??
    wallets.find((w) => w.isPrimary) ??
    wallets[0] ??
    null
  const network = chosenNetwork ?? toNetwork(selectedWallet?.network)

  const quote = useQuery(
    quoteQueryOptions({
      items: items.map(({ nftId, editionId, quantity }) => ({ nftId, editionId, quantity })),
      ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
    }),
  )
  const currentTotal = quote.data?.totalEth ?? null
  // O primeiro total exibido é o revisado; mudanças posteriores pedem aceite.
  if (acceptedTotal === null && currentTotal !== null) setAcceptedTotal(currentTotal)
  const isQuoteChanged =
    acceptedTotal !== null && currentTotal !== null && currentTotal !== acceptedTotal

  const quoteError = quote.error instanceof ApiError ? quote.error : null
  const couponError =
    quoteError && (quoteError.code === 'COUPON_INVALID' || quoteError.code === 'COUPON_EXPIRED')
      ? quoteError
      : null

  // A conexão vale para a combinação exata escolhida; mudar qualquer uma desconecta.
  const activeConnection =
    connection &&
    selectedWallet &&
    connection.walletId === selectedWallet.id &&
    connection.network === network &&
    connection.provider === provider
      ? connection
      : null
  const connectError = connectWallet.error instanceof ApiError ? connectWallet.error : null
  const connectionStatus: WalletConnectionStatus = connectWallet.isPending
    ? 'connecting'
    : activeConnection
      ? 'connected'
      : connectError?.code === 'WALLET_REJECTED'
        ? 'rejected'
        : 'idle'

  const blockers: string[] = []
  if (pendingOrder) blockers.push('Você já tem uma compra em andamento.')
  // Em erro, o TanStack Query mantém a cotação anterior: ela não pode valer para confirmar.
  if (quoteError) blockers.push(quoteError.message)
  else if (!quote.data) blockers.push('Calculando o total…')
  if (items.some((item) => item.quantity > item.available)) {
    blockers.push('Há itens sem estoque suficiente. Ajuste o carrinho para continuar.')
  }
  if (isQuoteChanged) blockers.push('Revise e aceite o novo total.')
  if (!selectedWallet) blockers.push('Cadastre uma carteira para pagar.')
  else if (!activeConnection) blockers.push('Conecte a carteira para confirmar.')

  const orderError = createOrder.error instanceof ApiError ? createOrder.error : null
  const orderErrorMessage = orderError
    ? (ORDER_ERROR_MESSAGES[orderError.code] ?? orderError.message)
    : null

  function resetConnectionAttempt() {
    connectWallet.reset()
  }

  function selectWallet(walletId: string) {
    setChosenWalletId(walletId)
    setChosenNetwork(null)
    resetConnectionAttempt()
  }

  function selectNetwork(value: Network) {
    setChosenNetwork(value)
    resetConnectionAttempt()
  }

  function selectProvider(value: WalletProvider) {
    setProvider(value)
    resetConnectionAttempt()
  }

  function connect() {
    if (!selectedWallet) return
    connectWallet.mutate(
      { walletId: selectedWallet.id, provider, network },
      { onSuccess: (created) => setConnection(created) },
    )
  }

  function disconnect() {
    if (connection) disconnectWallet.mutate(connection.connectionId)
    setConnection(null)
  }

  function applyCoupon(code: string) {
    const normalized = code.trim().toUpperCase()
    setAppliedCoupon(normalized)
    storeCoupon(normalized)
    // Mudança pedida pelo próprio usuário: o novo total já é o revisado.
    setAcceptedTotal(null)
  }

  function removeCoupon() {
    setAppliedCoupon(undefined)
    storeCoupon(undefined)
    setAcceptedTotal(null)
  }

  function acceptNewTotal() {
    if (currentTotal !== null) setAcceptedTotal(currentTotal)
  }

  function openReview() {
    if (blockers.length === 0) setIsReviewOpen(true)
  }

  function submitOrder() {
    if (
      !selectedWallet ||
      !activeConnection ||
      acceptedTotal === null ||
      isQuoteChanged ||
      !quote.data ||
      pendingOrder
    ) {
      return
    }
    const body = {
      quoteId: quote.data.quoteId,
      items: items.map(({ nftId, editionId, quantity }) => ({ nftId, editionId, quantity })),
      ...(appliedCoupon ? { couponCode: appliedCoupon } : {}),
      walletId: selectedWallet.id,
      connectionId: activeConnection.connectionId,
      network,
      expectedTotalEth: acceptedTotal,
    }
    const stored = readAttempt(ownerKey)
    const sameAttempt =
      stored !== null &&
      JSON.stringify(comparableBody(stored.body)) === JSON.stringify(comparableBody(body))
    const nextAttempt: Attempt = sameAttempt ? stored : { key: createIdempotencyKey(), body }
    writeAttempt(ownerKey, nextAttempt)

    createOrder.mutate(
      { body, idempotencyKey: nextAttempt.key },
      {
        onSuccess: (order) => {
          writeAttempt(ownerKey, null)
          clearCheckoutDraft(ownerKey)
          clearCheckoutPrefs(ownerKey)
          storeCoupon(undefined)
          setIsReviewOpen(false)
          void queryClient.invalidateQueries({
            queryKey: queryKeys.orders.pending(ownerKey),
          })
          void navigate({ to: '/pedido/$orderId', params: { orderId: order.id } })
        },
        onError: (error) => {
          setIsReviewOpen(false)
          if (!(error instanceof ApiError)) return
          if (error.code === 'STALE_QUOTE' || error.code === 'AVAILABILITY_CONFLICT') {
            void queryClient.invalidateQueries({ queryKey: queryKeys.quote.all })
            void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all(ownerKey) })
          }
          if (error.code === 'WALLET_DISCONNECTED') setConnection(null)
          if (error.code === 'ORDER_PENDING') {
            void queryClient.invalidateQueries({ queryKey: queryKeys.orders.pending(ownerKey) })
            const orderId = error.fields?.orderId
            if (orderId) {
              void navigate({ to: '/pedido/$orderId', params: { orderId } })
            }
          }
          // A tentativa anterior já virou pedido com outros dados: esta é uma nova compra.
          if (error.code === 'IDEMPOTENCY_CONFLICT') {
            writeAttempt(ownerKey, null)
          }
        },
      },
    )
  }

  return {
    cartQuery,
    items,
    pendingOrder,
    pendingOrdersQuery: pendingOrders,
    profile: profileQuery.data,
    isProfileLoading: profileQuery.isLoading,
    walletsQuery,
    wallets,
    selectedWallet,
    network,
    provider,
    quote: quote.data,
    isQuoteLoading: quote.isLoading,
    couponError,
    appliedCoupon,
    acceptedTotal,
    isQuoteChanged,
    connectionStatus,
    activeConnection,
    connectErrorMessage: connectError?.message ?? null,
    blockers,
    canReview: blockers.length === 0,
    isReviewOpen,
    isSubmitting: createOrder.isPending,
    orderErrorMessage,
    selectWallet,
    selectNetwork,
    selectProvider,
    connect,
    disconnect,
    applyCoupon,
    removeCoupon,
    acceptNewTotal,
    openReview,
    closeReview: () => setIsReviewOpen(false),
    submitOrder,
  }
}

export type CheckoutState = ReturnType<typeof useCheckout>
