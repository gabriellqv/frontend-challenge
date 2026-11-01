# Auditoria comparativa — estado final

Snapshot: 01/11/2026, commit `1278752`, deploy em
<https://frontend-challenge-beta.vercel.app>.

## Evidências executadas

| Verificação | Resultado |
| --- | --- |
| `typecheck`, `lint`, `format:check`, `build` | passaram |
| Vitest | 50/50 |
| Playwright | 147 casos, 142 aprovados, 5 skips, 0 falhas |
| Smoke no deploy | 15/15 (conta + checkout) |
| Lighthouse mobile | 91/100/100/100 e 90/100/100/100 |
| Lighthouse desktop | 100/100/100/100 e 99/100/100/100 |
| Dependências de produção | 0 vulnerabilidades (`npm audit --omit=dev`) |

Os resultados de Lighthouse são medianas de três execuções e estão em
[`lighthouse/summary.json`](../lighthouse/summary.json). A paridade exata entre
o bundle local e o publicado na Vercel não foi comprovada por hash.

## Ranking comparativo

| Posição | Projeto | Nota estimada |
| ---: | --- | ---: |
| 1 | CarlosEduardoFurlan | 95,5 |
| 2 | J4kedi | 94,5 |
| 2 | Moharu | 94,5 |
| 2 | **Kurio (este projeto)** | **94,5** |
| 5 | thiagohila | 93,5 |
| 6 | DevSamuelBarbosa | 90,5 |
| 7 | jesse-vicente / rukado | 90,0 |
| 9 | Obeavis | 89,5 |
| 10 | thgoo / Palhares17 | 88,5 |

As notas dos concorrentes são as da investigação anterior e não foram
reavaliadas nesta rodada. A margem de erro é de aproximadamente ±0,5 ponto.

## Pontuação por critério

| Critério | Peso | Nota |
| --- | ---: | ---: |
| Fidelidade visual e responsividade | 20 | 18,0 |
| Fluxos e experiência | 20 | 19,0 |
| Integração e estado | 15 | 15,0 |
| Tempo real | 10 | 9,5 |
| Mocking | 10 | 9,5 |
| Testes | 10 | 9,5 |
| Acessibilidade | 5 | 5,0 |
| Performance | 5 | 4,5 |
| Arquitetura e documentação | 5 | 4,5 |
| **Total** | **100** | **94,5** |

## O que está comprovado

- Todos os fluxos obrigatórios, incluindo perfil completo, carteiras,
  checkout com cotação versionada, pedido pendente, rascunho e recibo imutável.
- Catálogo com estado na URL, filtros combináveis, ordenação, paginação,
  histórico, vazio, erro e respostas fora de ordem.
- Tempo real pelo `socket.io-client`, com identidade, versão, deduplicação,
  isolamento por usuário, reconexão e recuperação de pedido pendente.
- MSW como backend de REST e Socket.IO, com persistência, reset, dois usuários
  e cenários determinísticos de falha, latência, estoque, cupom e pagamento.
- Axe `serious`/`critical` em oito telas, reflow 320 px público e privado,
  foco em diálogos/drawers e Lighthouse de acessibilidade em 100.
- Regressão visual de início, detalhe, carrinho e pagamento no desktop.

## Lacunas conhecidas

1. **Perfil não é pixel-perfect**: o Figma organiza os campos em duas colunas
   na mesma área; a implementação usa dois cards com campos empilhados. O
   conteúdo e as validações estão completos.
2. **Prova visual não versionada**: não há capturas lado a lado do Figma nem
   matriz requisito → arquivo → teste.
3. **390 px**: a suíte mobile principal usa Pixel 7 (412 px); 390 px aparece
   nos testes específicos de acessibilidade/reflow.
4. **Regressão visual mobile** não possui baselines próprias.
5. **Controle de relógio**: o cenário de latência ainda usa uma espera fixa de
   2 s; os demais cenários usam esperas por condição.
6. **Cenário nomeado de acesso não autorizado (403)** não existe; o
   comportamento é coberto por sessão expirada, guardas e 404 de pedido alheio.
7. **Segurança de demonstração**: token em `localStorage` e na query do socket,
   hash de senha não criptográfico no mock e alguns corpos de handler lidos com
   `as`. Nada disso deve ser transportado para produção.
8. **Deploy/commit**: o deploy responde e serve os arquivos novos, mas a
   igualdade exata entre o bundle publicado e o build local não foi provada.
9. **Documentação**: os documentos internos de planejamento continuam fora do
   git por decisão de escopo; este arquivo e os docs 12/13 são as exceções
   publicadas.

## O que falta para o primeiro lugar

- Alinhar o perfil ao Figma e versionar a comparação visual.
- Subir o Lighthouse mobile para a faixa de 95/92.
- Adicionar a matriz de rastreabilidade e a pasta de comparação com o Figma.
- Fechar os gaps de teste (visual mobile, `page.clock`, 390 px).
- Endurecer a camada de mock (zod nos corpos, token via `auth`) e confirmar a
  paridade do deploy.
