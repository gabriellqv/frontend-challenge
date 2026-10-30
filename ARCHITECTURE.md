# Arquitetura — Kurio

Documento técnico do projeto: decisões, fluxos de dados e limitações. Setup e
comandos estão no [`README.md`](./README.md).

## 1. Visão geral

```
Navegador
├── React 19 + TanStack Router (rotas e search params na URL)
│     └── TanStack Query (queries/mutations) → Axios → REST /api/*
│     └── socket.io-client ── wss://realtime.kurio.test
│
└── MSW (service worker)
      ├── handlers REST → banco simulado (localStorage: kurio:mock-db)
      └── WebSocket (socket.io-binding) → eventos nft.updated / order.updated
```

Não existe backend real: **toda** a rede é interceptada pelo MSW no navegador,
inclusive no build publicado. As mudanças no "banco" são refletidas tanto nas
respostas REST quanto nos eventos de tempo real.

## 2. Estrutura

```
src/
  app/            env, query client, mount (render)
  routes/         rotas file-based (composição + validação de search)
  features/
    catalog/      api (queryOptions) + componentes (card, grid, filtros, paginação)
    favorites/    api (query + toggle otimista)
    cart/         api (cart + quote + mutations)
    orders/       api (pedido + criação idempotente)
    account/      api (perfil + carteiras)
    auth/         api (sessão + login + registro + logout)
  shared/
    api/          http-client (Axios + ApiError), query-keys
    contracts/    schemas zod (fonte única dos tipos de transporte)
    lib/          cn, money (big.js), hash, array
    session/      token + visitante + ownerKey
    realtime/     url, cliente socket.io, hook de reconciliação
    ui/           primitivos shadcn/ui adaptados
    components/   layout (header/footer/skip) e skeletons
  mocks/          db, fixtures, handlers, pricing, scenarios, realtime, browser
```

## 3. Contratos REST

Base `/api`. Erros no envelope `{ error: { code, message, fields?, retryable? } }`.

| Recurso   | Endpoints                                                                                  |
| --------- | ------------------------------------------------------------------------------------------ |
| Sessão    | `POST /auth/register`, `POST /auth/login`, `GET /auth/session`, `POST /auth/logout`        |
| NFTs      | `GET /nfts` (busca/filtros/ordenação/paginação), `GET /nfts/:id`                           |
| Favoritos | `GET /favorites`, `POST /favorites/:nftId`, `DELETE /favorites/:nftId`                     |
| Carrinho  | `GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId` |
| Cotação   | `POST /quote`                                                                              |
| Pedidos   | `POST /orders` (header `Idempotency-Key`), `GET /orders/:id`                               |
| Perfil    | `GET /profile`, `PATCH /profile`, `POST /profile/password`                                 |
| Carteiras | `GET /wallets`, `POST /wallets`, `PATCH /wallets/:id`                                      |

Códigos: `VALIDATION_ERROR`, `SESSION_INVALID`, `UNAUTHORIZED`, `FORBIDDEN`,
`NOT_FOUND`, `CONFLICT`, `AVAILABILITY_CONFLICT`, `COUPON_INVALID`,
`COUPON_EXPIRED`, `STALE_QUOTE`, `TIMEOUT`, `NETWORK_ERROR`.

## 4. Eventos Socket.IO

| Evento          | Payload                        | Efeito                             |
| --------------- | ------------------------------ | ---------------------------------- |
| `nft.updated`   | `{ nftId, version, priceEth }` | atualiza catálogo/detalhe/carrinho |
| `order.updated` | `{ orderId, status, version }` | atualiza o estado do pedido        |

- Versão crescente por recurso; o cliente reconcilia com a API REST (fonte de
  verdade) ao receber o evento, invalidando as queries afetadas.
- Após reconexão, os dados são re-buscados via REST.
- Listeners são liberados no unmount (`socket.close()`).

## 5. Sessão

- Token opaco no `localStorage` (`kurio:token`); **senha nunca é persistida**
  (o banco guarda apenas um hash do mock).
- `ownerKey` = `user:<token>` (autenticado) ou `visitor:<visitorId>` — isola o
  cache/queries por dono.
- A sessão é recuperada no refresh via `GET /auth/session` (query habilitada
  quando há token).
- Logout limpa o token e o cache (`queryClient.clear()`).
- **Merge do carrinho**: ao logar, o carrinho do visitante é mesclado no do
  usuário (no handler de login), preservando os itens.

## 6. Carrinho e cotação

- Persistido no "banco" do mock por `ownerKey`.
- Itens guardam `nftId`, `editionId`, `quantity`, `priceEth` (string decimal) e
  `available`.
- Resumo (subtotal, desconto, taxa de rede, total) vem da **cotação da API**
  (`POST /quote`), calculada com `big.js`. ETH nunca trafega como `number`.
- Cupom validado na cotação (`KURIO10`, `LANCAMENTO5`, `EXPIRADO20`).

## 7. Pedido, idempotência e confirmação

- `POST /orders` exige `Idempotency-Key`; a mesma chave + mesmo corpo recupera o
  mesmo pedido. A chave é mantida em `sessionStorage` por tentativa (sobrevive a
  refresh/timeout), evitando compra dupla.
- O pedido nasce `pending`; o mock confirma (ou recusa, no cenário
  `payment_declined`) após ~2 s e emite `order.updated`.
- O recibo é um **snapshot** (itens/preços no momento da criação), imune a
  mudanças posteriores no catálogo.

## 8. Cache, retries e sincronização

- `staleTime` de 15 s; `refetchOnWindowFocus` ligado.
- Sem retry para erros 4xx; retry limitado (2) para transitórios/5xx.
- Mutations sem retry automático (idempotência cobre o pedido).
- Query keys isolam por usuário (`ownerKey`) e parâmetros (filtros/página).

## 9. Decisões de UX e desvios do Figma

O Figma tinha inconsistências visuais (grid desalinhado, preços duplicados,
rótulos colados, “...” solto no hero). Seguimos a **intenção visual** e
corrigimos os defeitos técnicos:

- **Grid alinhado** (`h-full` + `aspect-square`), sem buracos.
- **Um preço por card** (sem duplicação).
- **Rotas reais** (TanStack Router) — sem recarregar a página.
- **Responsivo** em 390/768/1440.
- Ajustes de acessibilidade (foco visível, labels, `aria-live`).

## 10. Limitações

- Mocks em memória + `localStorage`: um reset restaura o seed; não há backend
  real.
- `@mswjs/socket.io-binding` não implementa salas/namespaces/broadcast real;
  os eventos são roteados por conexão.
- A simulação de pagamento usa um timer fixo; cenários controlam o resultado.
- Sem upload real de avatar (usa URL).

## 11. Testes

- **Unit (Vitest)**: matemática de ETH (`big.js`), cupom e helpers.
- **E2E (Playwright)**: catálogo (busca/filtros/paginação/URL/histórico),
  detalhe/404, carrinho, login/logout, merge do carrinho, compra completa,
  skeleton lento, falha+retry e pagamento recusado.
