## Why

O PRD (Fluxo 1 — Recebimento, passos 4 e 5) diz explicitamente: *"O operador **recebe a indicação de qual posição** do armazém deve guardar cada item"* e *"leva os produtos até as posições indicadas e **confirma a alocação**"*. Hoje o recebimento (ENTRADA) funciona, mas o operador **escolhe** a posição de destino livremente — não há **sugestão do sistema** de onde guardar. Este é um dos dois pontos onde a entrega diverge do texto literal do PRD.

## What Changes

- Ao registrar uma **ENTRADA** (e uma **DEVOLUÇÃO de cliente**, que também é entrada), o sistema SHALL **sugerir uma posição de destino recomendada** para o produto, exibindo-a com destaque ("Sugerida") e já **pré-selecionada** — o operador confirma ou escolhe outra (a escolha continua livre).
- **Estratégia de sugestão (consolidação):** recomendar primeiro uma posição onde o produto **já tem saldo** (para consolidar o item); se não houver nenhuma, recomendar a primeira posição disponível na ordem do armazém (Área/Corredor/Posição). Mostrar o saldo atual da posição sugerida.
- A submissão do formulário é a **confirmação da alocação** (passo 5 do PRD): registra a entrada na posição confirmada e atualiza o saldo — comportamento atômico já existente.
- Nova leitura `suggestPutAwayPosition(productId)` em movimentações; ajuste no formulário de movimentação para exibir e pré-selecionar a sugestão.

Não inclui: realocação automática (o sistema não move sozinho), regras de capacidade/volume por posição (não há esse dado no schema), mudança de schema.

## Capabilities

### New Capabilities
- `put-away`: sugestão da posição de destino no recebimento, com estratégia de consolidação, exibida e pré-selecionada no formulário de ENTRADA/DEVOLUÇÃO de cliente, confirmada pelo operador.

### Modified Capabilities
<!-- Nenhuma alteração de requisito em `movements`: a ENTRADA continua exigindo destino; a sugestão é uma camada adicional que apenas pré-preenche e recomenda. -->

## Impact

- **Código**: nova leitura `suggestPutAwayPosition` em `src/modules/movements/queries.ts`; ajuste em `src/modules/movements/components/movement-form.tsx` (destaque + pré-seleção da sugestão). Reusa `listPositionOptions`/`listStockWithBalance`.
- **Dados**: usa `StockItem`/`Position` já existentes; sem mudança de schema, sem migration.
- **UI**: badge "Sugerida" no seletor de destino e pré-seleção automática ao escolher o produto.
- **Fecha** o passo de "indicação de posição" do Fluxo 1 do PRD.
