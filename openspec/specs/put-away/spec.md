# put-away Specification

## Purpose
TBD - created by archiving change put-away-suggestion. Update Purpose after archive.
## Requirements
### Requirement: Sugestão de posição no recebimento

Ao registrar uma entrada de mercadoria (ENTRADA ou DEVOLUÇÃO de cliente), a aplicação SHALL sugerir uma posição de destino recomendada para o produto e pré-selecioná-la, mantendo o operador livre para escolher outra posição.

#### Scenario: Produto já tem saldo em posições

- **WHEN** o operador seleciona, numa entrada, um produto que já possui saldo em uma ou mais posições
- **THEN** a aplicação sugere e pré-seleciona a posição onde o produto tem maior saldo, sinalizando-a como sugerida

#### Scenario: Produto sem saldo em nenhuma posição

- **WHEN** o operador seleciona, numa entrada, um produto que não tem saldo em nenhuma posição
- **THEN** a aplicação sugere e pré-seleciona a primeira posição na ordem do armazém

#### Scenario: Operador sobrepõe a sugestão

- **WHEN** há uma posição sugerida e o operador escolhe outra posição de destino
- **THEN** a entrada é registrada na posição escolhida pelo operador

### Requirement: Confirmação da alocação

A submissão do registro de entrada SHALL confirmar a alocação na posição de destino selecionada, atualizando o saldo daquela posição.

#### Scenario: Confirmar a alocação sugerida

- **WHEN** o operador confirma a entrada com a posição sugerida
- **THEN** a mercadoria é alocada naquela posição e o saldo é atualizado

### Requirement: Sugestão restrita a entradas

A aplicação SHALL aplicar a sugestão de posição apenas a movimentações que guardam mercadoria (ENTRADA e DEVOLUÇÃO de cliente), não a saídas, transferências ou devoluções a fornecedor.

#### Scenario: Saída não recebe sugestão de put-away

- **WHEN** o operador seleciona uma saída ou transferência
- **THEN** nenhuma posição de destino é sugerida pela lógica de put-away
