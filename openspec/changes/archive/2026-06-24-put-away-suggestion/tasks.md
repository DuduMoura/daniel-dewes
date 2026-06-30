## 1. Lógica de sugestão (dados)

- [x] 1.1 Criar uma função utilitária pura `suggestPutAwayPosition(productId, positions, stock)` (consolidação: maior saldo do produto; senão primeira posição) reusável no cliente
- [x] 1.2 Adicionar `suggestPutAwayPosition(productId)` em `src/modules/movements/queries.ts` (versão server-side, para reuso/casos sem dados carregados)

## 2. UI do formulário de movimentação

- [x] 2.1 No `movement-form.tsx`, ao selecionar o produto numa ENTRADA ou DEVOLUÇÃO de cliente, calcular a sugestão a partir de `listStockWithBalance` + `listPositionOptions` e **pré-selecionar** a posição de destino
- [x] 2.2 Exibir um indicador "Sugerida" na opção/seletor de destino, mostrando o saldo atual da posição sugerida quando houver
- [x] 2.3 Garantir que trocar o produto recalcula a sugestão e que o operador pode sobrepor livremente; saídas/transferências não recebem sugestão

## 3. Validação

- [x] 3.1 Rodar typecheck (`tsc --noEmit`) e build (`next build`) sem erros
- [x] 3.2 Validar a lógica de sugestão: produto com saldo → posição de maior saldo; produto sem saldo → primeira posição; sem posições → sem sugestão
