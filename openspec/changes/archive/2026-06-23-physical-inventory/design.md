## Context

O estoque já se movimenta atomicamente (`StockItem` por posição) e os alertas reconciliam via `syncAlerts`. Os modelos `Inventory` (status ABERTO/FECHADO, `closedAt`, `createdById?`) e `InventoryItem` (`productId`, `positionId?`, `systemQty`, `countedQty?`, `difference?`, com `onDelete: Cascade` no inventário) já existem. Não há jobs em background. Convenções valem conforme o `AGENTS.md`.

## Goals / Non-Goals

**Goals:**
- Abrir inventário com snapshot do saldo registrado; contar; ver divergências; encerrar ajustando o saldo.
- Encerramento atômico e reconciliação de alertas dos produtos ajustados.

**Non-Goals:**
- Contagem de itens fora do snapshot (achar produto em posição sem saldo registrado).
- Gerar `Movement` de ajuste (não há tipo AJUSTE; o inventário corrige o `StockItem` diretamente).
- Autenticação/RBAC; inventário cíclico/recorrente agendado.

## Decisions

### Snapshot na abertura
Ao abrir, para cada `StockItem` no escopo cria um `InventoryItem` com `systemQty = StockItem.quantity` (e `productId`/`positionId`). **Por quê:** congela o "saldo registrado no momento da abertura" (campo do modelo), base imutável da comparação. A contagem posterior não altera o `systemQty`.

### Escopo por área (opcional)
A abertura aceita uma seleção opcional de **áreas**; o snapshot inclui só os `StockItem` cujas posições pertencem às áreas escolhidas. Sem seleção → armazém inteiro. **Por quê:** o PRD pede "produtos ou áreas a conferir"; a área é o recorte físico natural (o operador percorre uma área). Recorte por produto fica para evolução futura.

### No máximo um inventário ABERTO por vez
A abertura é bloqueada se já existe um inventário `ABERTO`. **Por quê:** dois inventários abertos sobre as mesmas posições gerariam snapshots e ajustes conflitantes. Simplicidade e integridade.

### Contagem incremental, diferença derivada
`saveCount(itemId, countedQty)` grava a quantidade contada e calcula `difference = countedQty − systemQty`. Itens sem contagem ficam com `countedQty = null`. **Por quê:** o operador conta item a item ao longo do tempo; a diferença é sempre derivada do par (contado, snapshot), exibível na hora.

### Encerramento atômico ajusta o saldo
`closeInventory` roda em `prisma.$transaction`: para cada item **contado** (`countedQty != null`), faz `StockItem.quantity = countedQty` (valor absoluto, a realidade física); marca o `Inventory` como `FECHADO` + `closedAt`. Itens não contados não ajustam nada. **Por quê:** o encerramento é o momento do ajuste (PRD passo 6); usar o valor absoluto contado evita depender do saldo corrente (que pode ter mudado) — a contagem física é a fonte de verdade. Atômico para o estado não "rachar".

### Reconciliação de alertas pós-encerramento
Após a transação de encerramento, chama `syncAlerts(productId)` para cada produto ajustado (fora da transação, como na movimentação). **Por quê:** o ajuste muda o saldo total; um produto pode cruzar o estoque mínimo para cima ou para baixo.

### Ajuste direto no `StockItem`, sem `Movement`
O ajuste de inventário não cria um `Movement`. **Por quê:** o enum `MovementType` não tem AJUSTE; o inventário é um mecanismo de reconciliação à parte. Trade-off: o ajuste não aparece no histórico de movimentações — aceitável; o próprio inventário fechado é o registro da correção (com `systemQty`, `countedQty`, `difference` por item).

### Leitura/escrita no padrão da casa
Página `/inventario` é Server Component: mostra o inventário ABERTO (planilha de contagem) ou, se não houver, o formulário de abertura + histórico. Mutations via Server Actions com `revalidatePath` em `/inventario`, `/produtos`, `/alertas` e `/` (o saldo e os alertas mudam ao encerrar). **Por quê:** consistência e dados sempre atuais.

## Risks / Trade-offs

- **Movimentação durante a contagem** → se alguém registrar um movimento enquanto o inventário está aberto, o `StockItem` corrente diverge do `systemQty`; ao encerrar, o `countedQty` absoluto sobrescreve o saldo, podendo descartar esse movimento. Mitigação: um inventário aberto por vez + a contagem física é a verdade. Documentado; processo deve evitar movimentar área em contagem.
- **Ajuste sem `Movement`** → lacuna no histórico de movimentações; compensado pelo registro do inventário fechado.
- **Snapshot grande** → armazéns com muitos pares produto/posição geram muitos `InventoryItem`; o escopo por área limita. Aceitável no volume esperado.
- **Itens não contados ao encerrar** → ficam sem ajuste (saldo mantido). Decisão consciente: não assumir "zero" para não contado, evitando zerar saldo por esquecimento.
