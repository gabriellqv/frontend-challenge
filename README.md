# Kurio — Marketplace de NFTs

Marketplace de NFTs em **React + TypeScript**, fiel ao Figma do desafio da Jungle
Gaming. Fluxos de **descoberta, compra e conta do colecionador** em desktop e
mobile. Toda a API REST e o tempo real (**Socket.IO**) são simulados no
navegador com **MSW** — inclusive no build publicado.

## Stack

| Responsabilidade      | Tecnologia                             |
| --------------------- | -------------------------------------- |
| Interface / linguagem | React 19 + TypeScript (strict)         |
| Build                 | Vite                                   |
| Roteamento            | TanStack Router (search params na URL) |
| Estado remoto         | TanStack Query                         |
| HTTP                  | Axios                                  |
| Tempo real            | socket.io-client                       |
| Estilo / componentes  | Tailwind CSS 4 + shadcn/ui             |
| Mocking               | MSW + `@mswjs/socket.io-binding`       |
| Testes                | Vitest (unit) + Playwright (E2E)       |
| Auditoria             | Lighthouse (LHCI)                      |

## Requisitos

- **Node.js 22+** (ver `.nvmrc`)
- **npm 10+**

## Como rodar

```bash
npm ci
npm run dev          # http://localhost:5173
```

Build de produção local:

```bash
npm run build
npm run preview      # http://localhost:4173
```

## Variáveis de ambiente

Copie `.env.example` para `.env` (os padrões já funcionam):

| Variável            | Padrão                      | Para que serve                                          |
| ------------------- | --------------------------- | ------------------------------------------------------- |
| `VITE_ENABLE_MOCKS` | `true`                      | Liga o MSW (REST + Socket.IO). Também no build de demo. |
| `VITE_API_URL`      | `/api`                      | Base do REST (interceptado pelo MSW).                   |
| `VITE_SOCKET_URL`   | `wss://realtime.kurio.test` | Host fictício do Socket.IO (interceptado pelo MSW).     |

## Credenciais e dados fictícios

| Usuário                           | E-mail             | Senha      |
| --------------------------------- | ------------------ | ---------- |
| Nova Sato (carteiras + favoritos) | `nova@kurio.test`  | `kurio123` |
| Bruno Lima (sem carteiras)        | `bruno@kurio.test` | `kurio123` |

Cupons: `KURIO10` (10%), `LANCAMENTO5` (5%), `EXPIRADO20` (expirado). Qualquer
outro é inválido.

## Cenários do backend simulado

`?scenario=<nome>` na URL aplica o cenário; `?reset=1` restaura o seed; o painel
`window.__kurio` expõe a mesma API usada pelos testes.

| Cenário            | Efeito                                       |
| ------------------ | -------------------------------------------- |
| `default`          | estado estável, sem atraso                   |
| `empty`            | catálogo vazio                               |
| `slow`             | latência de 2,5 s nas respostas              |
| `offline`          | falha de conexão (erro de rede)              |
| `price_changed`    | muda o preço de um NFT e emite `nft.updated` |
| `payment_declined` | o pedido é recusado                          |

Reset: `/?reset=1` (ou `window.__kurio.reset()`).

## Comandos

```bash
npm run dev          # desenvolvimento com mocks
npm run build        # build de produção
npm run preview      # servir o build
npm run typecheck    # TypeScript strict
npm run lint         # ESLint
npm run format:check # Prettier
npm run test:unit    # Vitest
npm run test:e2e     # Playwright (Chromium)
npm run lighthouse   # auditoria Lighthouse (LHCI)
```

## Como reproduzir as falhas

| Situação                         | Passo a passo                                                                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sessão expirada**              | Entre com `nova@kurio.test`; o token expira em 1 h. Para forçar, use `window.__kurio.reset()` e recarregue, ou ajuste `SESSION_TTL_MS`.             |
| **Cupom inválido/expirado**      | No carrinho, aplique `XYZ` (inválido) ou `EXPIRADO20` (expirado).                                                                                   |
| **Preço alterado em tempo real** | Adicione um NFT ao carrinho e rode `?scenario=price_changed` (ou `window.__kurio.applyScenario('price_changed')`); o resumo atualiza via Socket.IO. |
| **Carregamento lento**           | Abra `/?scenario=slow` — skeleton com shimmer antes dos dados.                                                                                      |
| **Falha de conexão**             | Abra `/?scenario=offline` — erro com botão “Tentar novamente”.                                                                                      |
| **Pagamento recusado**           | `window.__kurio.applyScenario('payment_declined')` antes de confirmar a compra.                                                                     |
| **Carrinho preservado no login** | Adicione um item como visitante e faça login — o item permanece.                                                                                    |
| **Idempotência**                 | A criação do pedido usa `Idempotency-Key`; reenvios recuperam o mesmo pedido.                                                                       |

## Documentação técnica

- Contratos REST, eventos e decisões de arquitetura: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Justificativas, trade-offs e uso de IA: [`DECISOES.md`](./DECISOES.md)

## Deploy

> Preencha com a URL pública (Vercel) após o deploy.
