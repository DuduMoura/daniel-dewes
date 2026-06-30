## Context

A saída de estoque já existe como movimentação individual (`registerMovement` tipo SAÍDA), com baixa de saldo guardada (rejeita saldo insuficiente) dentro de `prisma.$transaction` e `syncAlerts` após o efeito. O schema tem `Movement`, `StockItem`, `Position`, `Product`, `User`, mas **não tem** uma entidade de pedido. Esta change adiciona o pedido multi-item e o processo de separação do Fluxo 2. Convenções valem conforme o `AGENTS.md` (Zod fonte de verdade; escrita em Server Actions; movimentação atômica).

## Goals / Non-Goals

**Goals:**
- Modelar o pedido de expedição com itens; separar com indicação de posição; expedir de forma atômica gerando as saídas.
- Reusar a baixa de saldo guardada e a reconciliação de alertas já existentes.

**Non-Goals:**
- Coleta de um item a partir de múltiplas posições (1 item = 1 posição de coleta).
- Reserva de estoque na abertura do pedido (a baixa é só na expedição).
- Roteirização da separação (ordem ótima de percurso); autenticação/RBAC.

## Decisions

### Novos modelos `Order` / `OrderItem` (+ enum `OrderStatus`)
```
enum OrderStatus { ABERTO EXPEDIDO CANCELADO }

model Order {
  id         String      @id @default(cuid())
  status     OrderStatus @default(ABERTO)
  note       String?
  createdAt  DateTime    @default(now())
  shippedAt  DateTime?
  createdById String?
  createdBy  User?       @relation(fields: [createdById], references: [id])
  items      OrderItem[]
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  productId   String
  quantity    Int                 // quantidade pedida
  pickedFromPositionId String?    // posição escolhida na coleta
  picked      Boolean  @default(false)
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product  @relation(fields: [productId], references: [id])
  pickedFrom  Position? @relation(fields: [pickedFromPositionId], references: [id])
  @@index([orderId])
}
```
Back-relations adicionadas em `Product` (`orderItems OrderItem[]`), `Position` (`orderItems OrderItem[]`) e `User` (`orders Order[]`). **Por quê:** modela o pedido com itens e a posição de coleta por item; `onDelete: Cascade` espelha `InventoryItem`. Migration via `npm run db:migrate`. Mudança **aditiva** (não altera colunas existentes).

### Separação: 1 item ⇒ 1 posição de coleta
Cada `OrderItem` é coletado de **uma** posição (a que o operador confirmar), que deve ter saldo ≥ quantidade pedida. **Por quê:** simplifica o modelo e a UI; cobre o caso comum. Coleta fracionada entre posições fica para evolução (exigiria múltiplas linhas de coleta por item).

### Indicação de posição reusa o saldo por produto
Na separação, para cada item o sistema lista as posições com saldo > 0 do produto (mesma leitura usada na SAÍDA e no put-away), exibindo a quantidade disponível. **Por quê:** consistência com o resto do sistema; é a "indicação de onde o produto está" do PRD (passo 2).

### Expedição atômica, reusando o padrão de baixa
`shipOrder(orderId)` valida que **todos** os itens estão coletados (`picked` + posição definida) e, em **uma** `prisma.$transaction`: para cada item, relê o `StockItem` da posição coletada, **rejeita se saldo insuficiente** (nada é gravado), faz o `decrement` e cria um `Movement` tipo **SAÍDA** (com `note` referenciando o pedido). Marca o pedido `EXPEDIDO` + `shippedAt`. Depois da transação, `syncAlerts(productId)` de cada produto. **Por quê:** o pedido inteiro expede ou nada expede (atomicidade — regra de ouro nº 2 estendida ao pedido); reusa exatamente a semântica da SAÍDA, então as saídas aparecem no histórico de Movimentações e na consulta do produto.

### Estados do pedido
`ABERTO` → (separar itens) → `shipOrder` → `EXPEDIDO`; ou `cancelOrder` → `CANCELADO` (só quando ABERTO; sem baixa de saldo). **Por quê:** ciclo mínimo e suficiente; cancelamento não toca estoque porque a baixa só ocorre na expedição.

### Schemas Zod e escrita em Server Actions
`createOrderSchema` (lista de itens: productId + quantity ≥ 1, ≥ 1 item), `pickItemSchema` (itemId + positionId), `orderIdSchema`. Mutations em Server Actions com `revalidatePath` em `/pedidos`, `/movimentacoes`, `/produtos`, `/alertas` e `/`. **Por quê:** mesma disciplina das demais features (regras de ouro nº 1 e 3).

## Risks / Trade-offs

- **Mudança de schema/migration** → primeira migration de feature; aditiva e de baixo risco (não altera dados existentes). Requer rodar `npm run db:migrate` no apply.
- **Saldo muda entre separar e expedir** → outra movimentação pode esvaziar a posição coletada antes da expedição; mitigado pela revalidação guardada **na transação** de expedição (rejeita se faltar saldo), preservando a integridade.
- **1 posição por item** → pedidos de itens espalhados exigem que a quantidade caiba numa posição; documentado como simplificação.
- **Sem reserva na abertura** → dois pedidos podem contar com o mesmo saldo até a expedição; a primeira expedição vence, a segunda é rejeitada por saldo insuficiente. Aceitável; reserva fica para evolução.
- **Item na sidebar** → adiciona `/pedidos` ao `app-sidebar` (camada de shell), alteração pequena e isolada.
