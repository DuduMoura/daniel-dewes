## 1. Módulo de movimentação (dados)

- [x] 1.1 Criar `src/modules/movements/schema.ts` (Zod: `type`, `productId`, `quantity` inteiro ≥ 1, campos de posição condicionais por tipo via `superRefine`; `direction` para DEVOLUÇÃO; tipos via `z.infer`)
- [x] 1.2 Criar `src/modules/movements/queries.ts`: `listMovements` (histórico recente com produto/posições/fornecedor, ordenado por `createdAt desc`); `listPositionsWithStock(productId)` (posições com saldo > 0 do produto); helpers de listas (produtos, posições, fornecedores) se necessário
- [x] 1.3 Criar `src/modules/movements/actions.ts` com `registerMovement` resolvendo o efeito no saldo por tipo, **tudo dentro de `prisma.$transaction`**: incremento via `upsert` no destino; decremento guardado (lê saldo, rejeita se insuficiente) na origem; cria o `Movement`
- [x] 1.4 Validar saldo nunca negativo em SAÍDA, DEVOLUÇÃO-a-fornecedor e TRANSFERÊNCIA (origem); retornar erro de "saldo insuficiente" sem persistir nada
- [x] 1.5 `revalidatePath` em `/movimentacoes`, `/produtos` e `/` (dashboard) após sucesso

## 2. UI da área de Movimentações

- [x] 2.1 Criar o formulário de movimentação (react-hook-form + zodResolver) com seleção de tipo e **campos condicionais** (destino, origem, ambos, ou direção da devolução)
- [x] 2.2 Selecionar produto e, para saídas/transferências, oferecer como origem apenas posições com saldo, exibindo a quantidade disponível
- [x] 2.3 Campos de fornecedor (opcional) para ENTRADA e DEVOLUÇÃO
- [x] 2.4 Criar a tabela de histórico (tipo, produto, quantidade, origem→destino, data)
- [x] 2.5 Exibir feedback de sucesso/erro com `sonner` (incl. saldo insuficiente)

## 3. Página e integração

- [x] 3.1 Substituir o placeholder de `src/app/movimentacoes/page.tsx` por Server Component que consome `listMovements` e as listas do formulário
- [x] 3.2 Tratar estado de histórico vazio e ausência de posições/produtos para movimentar

## 4. Validação

- [x] 4.1 Rodar typecheck (`tsc --noEmit`) e build (`next build`) sem erros
- [x] 4.2 Validar os fluxos no banco: entrada (upsert), saída (com e sem saldo), devolução (cliente/fornecedor), transferência (origem≠destino, saldo suficiente/insuficiente) e atomicidade (nada persiste quando rejeitado)
