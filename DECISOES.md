# Decisões do projeto

## Tema e produto

**Kurio**, um marketplace de NFTs (arte digital) sobre o enunciado da Jungle
Gaming. Escolhi manter o nome e a identidade do Figma (terracota + Roboto Mono)
e focar em **execução correta dos fluxos** — descoberta, compra e conta — em
desktop e mobile.

## Arquitetura e stack

- **Vite + React 19 + TypeScript strict**: SPA com mock no navegador, refresh de
  rota e deploy trivial na Vercel.
- **TanStack Router**: rotas file-based e search params validados com zod — a
  URL guarda busca/filtros/ordenação/paginação e sobrevive a refresh/histórico.
- **TanStack Query + Axios**: estado remoto com cache por `ownerKey`, invalidação
  coerente e um único cliente HTTP que valida respostas com zod.
- **MSW + `@mswjs/socket.io-binding`**: uma única camada de mock para REST e
  tempo real; componentes/hooks/Axios não contêm dados fictícios.
- **`big.js`** para ETH como string decimal (nunca `number`).
- **shadcn/ui** adaptado à identidade do Figma.

**O que ganhei:** contratos tipados de ponta a ponta, uma única fonte de mock e
testes E2E executáveis sem backend.
**O que perdi:** mais tempo de setup (Router + MSW + socket) do que um template
pronto; a simulação de Socket.IO exige transporte websocket e import dinâmico do
app após o worker subir.

## Decisões de produto

- **Idempotência**: o pedido usa `Idempotency-Key` guardada em `sessionStorage`
  por tentativa; clique repetido/timeout não duplica a compra.
- **Confirmação só com resposta da simulação**: o recibo aparece apenas quando o
  pedido é confirmado (evento `order.updated`).
- **Carrinho do visitante** é preservado ao logar (merge no handler de login).
- **ETH como string**: cálculos com `big.js`; a cotação da API é a referência.
- **Desvios do Figma**: alinhei o grid, unifiquei o preço por card e corrigi
  rótulos — mantendo a intenção visual. Documentado em `ARCHITECTURE.md`.

## Escopo consciente

- Sem integração real com blockchain, carteiras ou gateway de pagamento (dados
  simulados, conforme o enunciado).
- Sem upload real de avatar (URL).
- Páginas editoriais/suporte/atividade/ofertas ficaram fora (links “em breve”,
  sem aparentar sucesso funcional).

## Testes

- **Unit (Vitest)**: precisão de ETH, cupons e helpers.
- **E2E (Playwright)**: catálogo (busca/filtros/paginação/histórico), detalhe/404,
  carrinho, login/logout, merge do carrinho, compra completa, carregamento lento
  (skeleton), falha + retry e pagamento recusado.

## Uso de IA

Utilizei IA como apoio de produtividade, orquestrando agentes em paralelo para
tarefas bem delimitadas, com revisão e verificação a cada etapa.

**O que foi delegado vs. feito à mão**

- **Delegado a agentes**: análise de repositórios para reúso de tooling, extração
  de sombras do Figma, utilitários (`money`/`hash`/`array`) com testes, handlers
  REST de favoritos/carrinho/perfil, e os componentes visuais do catálogo.
- **Feito/revisado por mim**: contratos zod, cliente Axios, sessão, roteamento,
  mocks de pedidos e tempo real, integração da UI, cenários de falha e os testes
  E2E. Toda decisão de arquitetura passou por revisão manual.

**Onde a IA errou**

- Um agente afirmou que “Base UI é sucessora do Radix” — incorreto (é a
  biblioteca headless da MUI); corrigi a documentação.
- Um agente criou os componentes shadcn em um diretório literal `@/shared/ui`
  (alias não resolvido); movi para `src/shared/ui`.
- A IA às vezes “resume” o código em comentários (`// monta o snapshot…`);
  removi os comentários que repetiam o código, mantendo só o “porquê”.

**Decisões tomadas contra a sugestão da IA**

- **ETH nunca como `number`**: onde apareceu `Number(price) * quantity`,
  troquei por `big.js` (`mul`).
- **Sessão reativa no header**: em vez de confiar no token lido uma vez, gravei a
  sessão no cache do Query no login para o header atualizar sem reload.
- **Import dinâmico após o worker**: o `socket.io-client` só é carregado depois
  do `worker.start()`, garantindo o patch do WebSocket — lição do spike.
- **Sem gambiarras**: `<a href>` virou `Link`, e os `TODO` de rota foram
  resolvidos com rotas reais.
