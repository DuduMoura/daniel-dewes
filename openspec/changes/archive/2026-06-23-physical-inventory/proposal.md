## Why

O PRD (seção 3, "Controle e acompanhamento" + Fluxo 4) exige **realizar inventário com conferência entre o que o sistema registra e o que o operador conta fisicamente**. É o último fluxo do PRD ainda não implementado: os modelos `Inventory`/`InventoryItem` existem, mas a rota `/inventario` é um placeholder e não há como abrir uma contagem, registrar o contado, ver divergências nem ajustar o saldo. Com o estoque já se movimentando em tempo real, o inventário é o mecanismo que garante que o saldo registrado corresponde à realidade física.

## What Changes

- Implementar o **ciclo de inventário** na rota `/inventario`:
  - **Abrir**: cria um inventário e tira um **snapshot** do saldo atual (`StockItem`) de cada par produto/posição no escopo, gravando `systemQty` em `InventoryItem`. Escopo opcional por **área**; sem seleção, cobre o armazém inteiro.
  - **Contar**: o operador informa a quantidade física (`countedQty`) de cada item; o sistema calcula a **diferença** (`countedQty − systemQty`).
  - **Conferir**: itens com diferença ≠ 0 são **destacados** para revisão.
  - **Encerrar**: o gestor encerra o inventário e os itens contados **ajustam o saldo** (`StockItem.quantity` passa a ser o `countedQty`), de forma atômica. O inventário fica `FECHADO` com `closedAt`.
- Garantir **no máximo um inventário ABERTO por vez** (evita contagens sobrepostas na mesma posição).
- Reavaliar os **alertas** dos produtos ajustados após o encerramento (o saldo mudou).
- Novo módulo `src/modules/inventory` (`schema.ts`, `queries.ts`, `actions.ts`, `components/`). Substituir o placeholder de `src/app/inventario/page.tsx`.

Não inclui (fora de escopo): contar itens fora do snapshot (produto achado numa posição sem saldo registrado), gerar `Movement` de ajuste (o inventário ajusta o `StockItem` diretamente), autenticação (o `createdById` fica nulo).

## Capabilities

### New Capabilities
- `inventory`: abertura de inventário com snapshot do saldo, registro da contagem física, cálculo e destaque de divergências, e encerramento com ajuste atômico do saldo.

### Modified Capabilities
<!-- Nenhuma mudança de comportamento especificado em outras capabilities; o encerramento dispara a reconciliação de alertas como efeito (código). -->

## Impact

- **Código**: novo módulo `src/modules/inventory`; substitui o placeholder de `/inventario`; reusa `syncAlerts` (chamado após o encerramento) e componentes shadcn (`table`, `input`, `button`, `badge`, `select`).
- **Dados**: usa `Inventory` e `InventoryItem` já existentes (sem mudança de schema, sem migration). O encerramento atualiza `StockItem.quantity`.
- **UI**: tela de abertura (escopo por área), planilha de contagem com destaque de divergências, e histórico de inventários.
- **Completa** o conjunto funcional do PRD (Fluxos 1–5).
