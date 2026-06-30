## Why

O PRD (Fluxo 2 — Expedição de Pedido) descreve um **pedido com vários itens**: *"informa os itens do pedido"*, *"o sistema indica onde cada produto está localizado"*, *"coleta os itens nas posições indicadas e **confirma cada coleta**"*, *"Após reunir todos os itens, **confirma a expedição**"*. Hoje a saída existe apenas como movimentação **individual** por produto — não há a entidade **pedido** nem o processo de separação (picking) multi-item. Este é o segundo (e último) ponto onde a entrega diverge do texto literal do PRD.

## What Changes

- Introduzir a entidade **Pedido de expedição** com vários itens, numa nova área `/pedidos`:
  - **Criar pedido**: informar os itens (produto + quantidade). Status `ABERTO`.
  - **Separar (picking)**: para cada item, o sistema **indica as posições onde o produto tem saldo**; o operador escolhe a posição e **confirma a coleta** do item.
  - **Expedir**: com todos os itens coletados, o operador **confirma a expedição**; o sistema, de forma **atômica**, dá baixa no saldo de cada posição coletada e registra uma **movimentação de SAÍDA** por item; o pedido passa a `EXPEDIDO`. Também permite **cancelar** um pedido aberto (sem baixa).
  - Reavaliar os **alertas** dos produtos expedidos (o saldo caiu).
- **Mudança de schema (migration):** novos modelos `Order` e `OrderItem` + enum `OrderStatus` (ABERTO/EXPEDIDO/CANCELADO), com relações para `Product`/`Position`/`User`.
- Novo módulo `src/modules/orders`. Item na sidebar para `/pedidos`. As saídas geradas aparecem no histórico de Movimentações e na consulta do produto.

Não inclui: coleta de um item a partir de **múltiplas** posições (cada item é coletado de uma posição); reservas de estoque ao abrir o pedido (a baixa ocorre só na expedição); autenticação.

## Capabilities

### New Capabilities
- `orders`: criação de pedidos de expedição com múltiplos itens, separação (picking) com indicação de posição por produto e confirmação por item, e expedição atômica que dá baixa no estoque e registra as saídas.

### Modified Capabilities
<!-- Nenhuma alteração de requisito em `movements`: a expedição reusa o registro de SAÍDA já especificado, agrupando vários numa transação. -->

## Impact

- **Código**: novo módulo `src/modules/orders` (schema, queries, actions, components); nova rota `src/app/pedidos`; item na `app-sidebar`. Reusa o padrão de baixa de saldo guardada e `syncAlerts`.
- **Dados**: **mudança de schema** — `Order`, `OrderItem`, enum `OrderStatus`; back-relations em `Product`, `Position`, `User`. Requer **migration** (`npm run db:migrate`). Não altera modelos existentes de forma destrutiva (apenas adiciona relações).
- **UI**: lista de pedidos, criação com itens, tela de separação com posições sugeridas e confirmação por item, ação de expedir/cancelar.
- **Fecha** o Fluxo 2 do PRD ao pé da letra.
