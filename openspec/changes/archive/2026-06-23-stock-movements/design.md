## Context

Produtos, fornecedores e a hierarquia de localização (Área→Corredor→Posição) já estão funcionais. Os modelos `Movement` (com `type`, `productId`, `quantity`, `fromPositionId?`, `toPositionId?`, `supplierId?`, `userId?`) e `StockItem` (`@@unique([productId, positionId])`, `quantity`) já existem no schema. Esta change implementa a lógica que os movimenta, seguindo as regras de ouro do `AGENTS.md` — especialmente a nº 2: **toda movimentação roda dentro de `prisma.$transaction`**.

## Goals / Non-Goals

**Goals:**
- Registrar as 4 movimentações atualizando o saldo por posição, de forma atômica.
- Garantir saldo nunca negativo nas saídas/transferências.
- Histórico de movimentações.

**Non-Goals:**
- Alertas de estoque mínimo (change própria), inventário, autenticação/RBAC.
- Reserva/picking multi-linha de pedidos (uma movimentação registra um produto por vez).
- Edição/estorno de movimentações já registradas (o histórico é um livro-razão append-only; correções vêm de movimentações compensatórias — fora do escopo agora).

## Decisions

### Semântica de cada tipo (posições e efeito no saldo)
| Tipo | Origem (`fromPosition`) | Destino (`toPosition`) | Efeito no `StockItem` |
|---|---|---|---|
| ENTRADA | — | obrigatória | `+quantity` no destino |
| SAÍDA | obrigatória | — | `−quantity` na origem |
| DEVOLUÇÃO (cliente) | — | obrigatória | `+quantity` no destino |
| DEVOLUÇÃO (fornecedor) | obrigatória | — | `−quantity` na origem |
| TRANSFERÊNCIA | obrigatória | obrigatória (≠ origem) | `−quantity` origem, `+quantity` destino |

**Por quê:** mapeia diretamente os fluxos do PRD. A DEVOLUÇÃO tem duas direções (cliente = entra; fornecedor = sai), escolhidas por um campo `direction` no formulário que decide qual posição é pedida. O `supplierId` é opcional e relevante em ENTRADA e DEVOLUÇÃO a/de fornecedor.

### Atomicidade via `prisma.$transaction` (regra de ouro nº 2)
Cada action abre uma transação que: (1) valida saldo quando há saída; (2) atualiza o(s) `StockItem`; (3) cria o `Movement`. Se qualquer passo falhar, **tudo** é desfeito. **Por quê:** o saldo é a fonte de verdade do estoque; gravar o movimento sem ajustar o saldo (ou vice-versa) corromperia o sistema.

### Incremento via upsert; decremento guardado
- **Incremento** (destino): `upsert` no `StockItem` por `@@unique([productId, positionId])` — cria com `quantity` se não existir, senão `increment`.
- **Decremento** (origem): dentro da transação, ler o `StockItem` da origem; se inexistente ou `quantity < quantidade pedida`, **abortar** com erro de validação ("saldo insuficiente"); senão `decrement`.

**Por quê:** o upsert cobre a primeira entrada numa posição nova; o decremento guardado impede saldo negativo. A leitura+escrita ocorre dentro da mesma transação, então é consistente.

### Schema Zod discriminado por tipo
`movementSchema` valida `type`, `productId`, `quantity` (inteiro ≥ 1) e os campos de posição **conforme o tipo** (Zod `superRefine`/discriminated union): exige destino em ENTRADA, origem em SAÍDA, ambos e distintos em TRANSFERÊNCIA, e origem **ou** destino conforme a `direction` na DEVOLUÇÃO. **Por quê:** o mesmo schema valida no formulário e na action (regra de ouro nº 1); validar a forma do movimento cedo evita estados inválidos.

### Leitura/escrita no padrão da casa
Página `/movimentacoes` é Server Component que carrega produtos, posições (com seu saldo) e fornecedores para o formulário, e o histórico via `listMovements`. Mutations em Server Actions com `revalidatePath` em `/movimentacoes`, `/produtos` e `/` (dashboard), pois o saldo muda. **Por quê:** consistência e saldo sempre atual nas telas que o exibem.

### Seleção de origem orientada por saldo
Para SAÍDA/TRANSFERÊNCIA/DEVOLUÇÃO-a-fornecedor, o formulário oferece como origem apenas posições onde o produto **tem saldo > 0**, exibindo a quantidade disponível. **Por quê:** reduz erro do operador e torna o limite de saldo visível antes de submeter (a validação dura continua no servidor).

### `userId` nulo por enquanto
Sem auth, o `Movement.userId` fica `null`. **Por quê:** auth está adiada (decisão do `AGENTS.md`); o campo já existe para plugar o operador depois.

## Risks / Trade-offs

- **Corrida em saldo sob concorrência** → a leitura+decremento ocorre na transação (isolamento ReadCommitted padrão); em altíssima concorrência sobre a mesma posição, dois decrementos poderiam, em teoria, passar da validação. Mitigação aceitável agora: a janela é mínima no contexto single-tenant; um decremento condicional (`updateMany` com `where quantity >= n`) pode endurecer isso numa evolução futura.
- **DEVOLUÇÃO com duas direções** → adiciona um campo `direction` ao formulário; risco de confusão do usuário, mitigado por rótulos claros ("Devolução de cliente (entrada)" / "Devolução a fornecedor (saída)").
- **Append-only sem estorno** → não há editar/excluir movimento nesta change; correções exigem movimento compensatório. Aceitável: preserva a integridade do livro-razão; estorno pode virar feature depois.
- **Alertas fora do escopo** → uma SAÍDA pode derrubar o saldo abaixo do mínimo sem gerar alerta nesta change; isso é responsabilidade da change `min-stock-alerts`, que lê saldo vs. `minStock`.
