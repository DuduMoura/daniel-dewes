## 1. Módulo de inventário (dados)

- [x] 1.1 Criar `src/modules/inventory/schema.ts` (Zod: `openInventorySchema` com `areaIds: string[]` opcional e `note?`; `countSchema` com `itemId` + `countedQty` inteiro ≥ 0; `closeSchema` com `inventoryId`; tipos via `z.infer`)
- [x] 1.2 Criar `src/modules/inventory/queries.ts` (`getOpenInventory` com itens + produto + rótulo de posição; `listClosedInventories` para o histórico com contagem de itens/divergências)
- [x] 1.3 Criar `src/modules/inventory/actions.ts` — `openInventory`: bloqueia se já houver ABERTO; faz o snapshot dos `StockItem` no escopo (filtro por área quando informado) gravando `systemQty`
- [x] 1.4 `saveCount`: grava `countedQty` e calcula `difference = countedQty − systemQty` do item
- [x] 1.5 `closeInventory`: em `prisma.$transaction`, ajusta `StockItem.quantity = countedQty` de cada item contado e marca o inventário FECHADO + `closedAt`; depois chama `syncAlerts(productId)` dos produtos ajustados (fora da transação)
- [x] 1.6 `revalidatePath` em `/inventario`, `/produtos`, `/alertas` e `/` após as mutações

## 2. UI da área de Inventário

- [x] 2.1 Criar o formulário de abertura (seleção opcional de áreas + observação)
- [x] 2.2 Criar a planilha de contagem (produto, posição, saldo de sistema, input de contagem, diferença) com **destaque das divergências**
- [x] 2.3 Ação de encerrar inventário com confirmação (avisando que o saldo será ajustado)
- [x] 2.4 Criar o histórico de inventários encerrados (data, qtd. de itens, qtd. de divergências)
- [x] 2.5 Exibir feedback de sucesso/erro com `sonner`

## 3. Página e integração

- [x] 3.1 Substituir o placeholder de `src/app/inventario/page.tsx` por Server Component que mostra o inventário ABERTO (planilha) ou o formulário de abertura + histórico
- [x] 3.2 Tratar o estado de armazém sem estoque para inventariar

## 4. Validação

- [x] 4.1 Rodar typecheck (`tsc --noEmit`) e build (`next build`) sem erros
- [x] 4.2 Validar no banco: abrir (snapshot), bloqueio de segundo aberto, contar (diferença), encerrar ajustando o saldo (atômico), item não contado mantém saldo, e alerta reavaliado após o ajuste
