## Context

A ENTRADA já registra o recebimento numa posição de destino escolhida pelo operador, de forma atômica (`Movement` + `StockItem` em `prisma.$transaction`). O formulário de movimentação (`movement-form.tsx`) já carrega `listPositionOptions` (todas as posições com rótulo) e `listStockWithBalance` (saldos por produto). Falta apenas a camada de **recomendação** de onde guardar. Convenções valem conforme o `AGENTS.md`.

## Goals / Non-Goals

**Goals:**
- Sugerir e pré-selecionar uma posição de destino ao registrar entrada/devolução de cliente.
- Tornar a sugestão visível e sobreponível (o operador decide).

**Non-Goals:**
- Capacidade/volume por posição (não há dado no schema); realocação automática; mudança de schema.
- Alterar o requisito de ENTRADA (destino continua obrigatório).

## Decisions

### Estratégia de sugestão: consolidação
A sugestão é calculada por `suggestPutAwayPosition(productId)`:
1. Se o produto já tem saldo em alguma posição → sugerir a posição com **maior saldo atual** do produto (consolida o item num lugar já usado).
2. Senão → sugerir a **primeira posição** na ordem do armazém (Área/Corredor/Posição).
3. Se não há nenhuma posição cadastrada → sem sugestão.

**Por quê:** consolidar reduz fragmentação do estoque e facilita a separação depois; é uma heurística simples, previsível e sem dados extras de capacidade. Alternativas (espalhar, posição mais próxima da doca) exigiriam dados que o schema não tem.

### Sugestão é recomendação, não imposição
O formulário **pré-seleciona** a posição sugerida e a marca com um badge "Sugerida", mas o operador pode trocar para qualquer outra. A submissão confirma a alocação. **Por quê:** o PRD pede "indicação" + "confirmação"; manter a escolha livre respeita a realidade do operador (a posição sugerida pode estar fisicamente cheia).

### Aplica-se a entradas (ENTRADA e DEVOLUÇÃO de cliente)
A pré-seleção ocorre quando o tipo é ENTRADA, ou DEVOLUÇÃO com direção CLIENTE (ambas entram numa posição de destino). Para SAÍDA/TRANSFERÊNCIA/DEVOLUÇÃO a fornecedor, nada muda. **Por quê:** put-away é sobre **guardar** mercadoria que chega.

### Cálculo no cliente a partir dos dados já carregados
A sugestão é derivada no formulário a partir de `listStockWithBalance` + `listPositionOptions` (já no componente), sem ida extra ao servidor; uma função utilitária pura calcula a posição recomendada por produto. **Por quê:** os dados já estão presentes; evita round-trip e mantém a UI reativa à troca de produto. (Uma `suggestPutAwayPosition` server-side fica disponível para reuso/casos sem esses dados.)

## Risks / Trade-offs

- **Heurística simples** → consolidar nem sempre é o ideal (posição pode estar fisicamente lotada); mitigado por ser apenas sugestão sobreponível.
- **Sem capacidade por posição** → não dá para validar se "cabe"; fora do escopo (o schema não modela volume). Aceitável.
- **Pré-seleção pode mascarar escolha consciente** → o badge "Sugerida" deixa claro que é recomendação; o operador vê e confirma.
