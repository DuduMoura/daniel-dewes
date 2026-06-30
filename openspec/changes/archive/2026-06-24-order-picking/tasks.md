## 1. Schema e migration

- [x] 1.1 Adicionar ao `prisma/schema.prisma`: enum `OrderStatus` (ABERTO/EXPEDIDO/CANCELADO), modelos `Order` e `OrderItem`, e back-relations em `Product`, `Position` e `User`
- [x] 1.2 Rodar `npm run db:migrate` (criar a migration) e `npm run db:generate` (atualizar o client)

## 2. Módulo de pedidos (dados)

- [x] 2.1 Criar `src/modules/orders/schema.ts` (Zod: `createOrderSchema` com itens [productId + quantity ≥ 1, mínimo 1 item] e `note?`; `pickItemSchema` [itemId + positionId]; `orderIdSchema`)
- [x] 2.2 Criar `src/modules/orders/queries.ts` (`listOrders` com estado e contagem de itens; `getOrder` com itens, produto e posições com saldo do produto para a separação)
- [x] 2.3 Criar `src/modules/orders/actions.ts` — `createOrder` (cria pedido + itens, status ABERTO)
- [x] 2.4 `pickItem` (grava `pickedFromPositionId` + `picked=true`; valida saldo suficiente na posição)
- [x] 2.5 `shipOrder` — em `prisma.$transaction`: exige todos os itens coletados; para cada item relê o saldo, rejeita se insuficiente, faz `decrement` e cria `Movement` SAÍDA (note do pedido); marca EXPEDIDO + `shippedAt`; depois `syncAlerts(productId)` dos produtos
- [x] 2.6 `cancelOrder` (só quando ABERTO; sem baixa); `revalidatePath` em `/pedidos`, `/movimentacoes`, `/produtos`, `/alertas`, `/`

## 3. UI da área de Pedidos

- [x] 3.1 Criar a listagem de pedidos (estado + qtd. de itens) e o formulário de criação (linhas de item: produto + quantidade)
- [x] 3.2 Criar a tela/seção de separação: por item, seletor de posição com saldo (quantidade disponível) e confirmação de coleta; indicar itens já coletados
- [x] 3.3 Ações de expedir (habilitada só com todos coletados) e cancelar, com confirmação e feedback `sonner`
- [x] 3.4 Adicionar o item "Pedidos" à `app-sidebar` (grupo Operação)

## 4. Página e integração

- [x] 4.1 Criar `src/app/pedidos/page.tsx` (lista + criação) e a separação do pedido selecionado (Server Components consumindo `listOrders`/`getOrder`)
- [x] 4.2 Tratar estados vazios (sem pedidos; sem produtos para montar pedido)

## 5. Validação

- [x] 5.1 Rodar typecheck (`tsc --noEmit`) e build (`next build`) sem erros
- [x] 5.2 Validar no banco: criar pedido; coletar itens (saldo suficiente/insuficiente); expedir (baixa atômica + saídas registradas; rejeição quando item não coletado ou saldo insuficiente, sem persistir); cancelar; alerta reavaliado após expedição
