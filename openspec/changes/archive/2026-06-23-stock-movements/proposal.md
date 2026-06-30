## Why

A movimentação de estoque é o **coração do WMS**. O PRD (seção 3, "Movimentação de estoque") exige registrar entrada, saída, devolução e transferência de produtos; e os Fluxos 1 (recebimento), 2 (expedição) e 5 (consulta/histórico) dependem disso. Hoje os modelos `Movement` e `StockItem` existem, mas nada os movimenta: a rota `/movimentacoes` é um placeholder e o saldo (`StockItem.quantity` por posição) nunca muda. Com produtos, fornecedores e posições já cadastrados, esta é a peça que dá vida ao estoque em tempo real.

## What Changes

- Implementar o **registro das 4 movimentações** na rota `/movimentacoes`, cada uma atualizando o saldo por posição:
  - **ENTRADA** — recebimento: soma quantidade na **posição destino** (fornecedor opcional). Fluxo 1.
  - **SAÍDA** — expedição/consumo: subtrai da **posição origem**. Fluxo 2.
  - **DEVOLUÇÃO** — de cliente (entra na posição destino) ou a fornecedor (sai da posição origem), escolhido no formulário.
  - **TRANSFERÊNCIA** — move quantidade da **posição origem** para a **posição destino** (mesmo produto).
- **Atomicidade (regra de ouro nº 2):** gravar o `Movement` + atualizar o(s) `StockItem` roda dentro de `prisma.$transaction`. O saldo nunca "racha".
- **Saldo nunca negativo:** saídas/transferências validam, dentro da transação, que a posição origem tem saldo suficiente; caso contrário a operação é rejeitada e nada é gravado.
- **Histórico de movimentações** (Fluxo 5): listagem das movimentações recentes com tipo, produto, quantidade, posições e data.
- Novo módulo `src/modules/movements` (`schema.ts`, `queries.ts`, `actions.ts`, `components/`), seguindo o padrão das features existentes. Substituir o placeholder de `src/app/movimentacoes/page.tsx`.

Não inclui (changes futuras): **alertas** de estoque mínimo (Fluxo 3 — change própria), **inventário** (Fluxo 4) e autenticação (o `userId` do movimento fica nulo até a change de auth).

## Capabilities

### New Capabilities
- `movements`: registro atômico de ENTRADA/SAÍDA/DEVOLUÇÃO/TRANSFERÊNCIA com atualização do saldo por posição (`StockItem`), validação de saldo suficiente e histórico de movimentações.

### Modified Capabilities
<!-- Nenhuma — products/suppliers/locations não mudam de comportamento; apenas passam a ter o saldo movimentado. -->

## Impact

- **Código**: novo módulo `src/modules/movements`; substitui o placeholder de `src/app/movimentacoes/page.tsx`; reusa componentes shadcn (`select`, `dialog`, `table`, `input`, `button`).
- **Dados**: usa `Movement` e `StockItem` já existentes (sem mudança de schema, sem migration). Passa a escrever em `StockItem.quantity`.
- **UI**: formulário de movimentação com campos condicionais por tipo + tabela de histórico.
- **Habilita**: a change de alertas (lê saldo vs. estoque mínimo) e a de inventário (compara saldo registrado vs. contagem). O dashboard e a listagem de produtos passam a refletir saldos reais.
