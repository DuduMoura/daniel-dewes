## ADDED Requirements

### Requirement: Registro de entrada de mercadoria

A aplicação SHALL permitir registrar uma ENTRADA informando produto, quantidade (inteiro ≥ 1), posição de destino e, opcionalmente, o fornecedor. O saldo da posição de destino SHALL ser somado pela quantidade informada.

#### Scenario: Entrada em posição com saldo existente

- **WHEN** o operador registra uma entrada de N unidades de um produto numa posição que já tem saldo
- **THEN** o saldo daquela posição aumenta em N e a movimentação é registrada no histórico

#### Scenario: Entrada em posição sem saldo prévio

- **WHEN** o operador registra uma entrada de N unidades de um produto numa posição onde ele ainda não tinha saldo
- **THEN** o saldo daquela posição passa a ser N

#### Scenario: Quantidade inválida

- **WHEN** o operador tenta registrar uma entrada com quantidade zero ou negativa
- **THEN** o registro é rejeitado com mensagem de validação

### Requirement: Registro de saída de mercadoria

A aplicação SHALL permitir registrar uma SAÍDA informando produto, quantidade (inteiro ≥ 1) e posição de origem. O saldo da posição de origem SHALL ser subtraído pela quantidade informada.

#### Scenario: Saída com saldo suficiente

- **WHEN** o operador registra a saída de N unidades de um produto numa posição cujo saldo é maior ou igual a N
- **THEN** o saldo daquela posição diminui em N e a movimentação é registrada no histórico

#### Scenario: Saída com saldo insuficiente

- **WHEN** o operador tenta registrar a saída de N unidades numa posição cujo saldo é menor que N
- **THEN** a operação é rejeitada com mensagem de saldo insuficiente e nenhum saldo é alterado

### Requirement: Registro de devolução

A aplicação SHALL permitir registrar uma DEVOLUÇÃO em uma de duas direções: de cliente (entra numa posição de destino, somando saldo) ou a fornecedor (sai de uma posição de origem, subtraindo saldo, com a mesma validação de saldo suficiente da saída).

#### Scenario: Devolução de cliente

- **WHEN** o operador registra uma devolução de cliente de N unidades numa posição de destino
- **THEN** o saldo daquela posição aumenta em N e a movimentação é registrada

#### Scenario: Devolução a fornecedor

- **WHEN** o operador registra uma devolução a fornecedor de N unidades a partir de uma posição com saldo suficiente
- **THEN** o saldo daquela posição diminui em N e a movimentação é registrada

### Requirement: Transferência entre posições

A aplicação SHALL permitir registrar uma TRANSFERÊNCIA de um produto entre duas posições distintas, informando quantidade (inteiro ≥ 1), posição de origem e posição de destino. O saldo da origem SHALL ser subtraído e o do destino somado pela mesma quantidade.

#### Scenario: Transferência com saldo suficiente

- **WHEN** o operador transfere N unidades de um produto de uma posição origem (com saldo ≥ N) para uma posição destino
- **THEN** o saldo da origem diminui em N, o do destino aumenta em N, e a movimentação é registrada

#### Scenario: Transferência com saldo insuficiente

- **WHEN** o operador tenta transferir N unidades de uma origem cujo saldo é menor que N
- **THEN** a operação é rejeitada e nenhum saldo é alterado

#### Scenario: Origem e destino iguais

- **WHEN** o operador tenta transferir para a mesma posição de origem
- **THEN** o registro é rejeitado com mensagem de validação

### Requirement: Atomicidade da movimentação

O registro de qualquer movimentação SHALL ser atômico: a gravação do `Movement` e a atualização do(s) saldo(s) de `StockItem` ocorrem na mesma transação. Se qualquer etapa falhar, nenhuma alteração SHALL ser persistida.

#### Scenario: Falha no meio da operação

- **WHEN** ocorre um erro ao atualizar o saldo durante o registro de uma movimentação
- **THEN** nem o movimento nem qualquer ajuste de saldo são persistidos (estado permanece como antes)

### Requirement: Histórico de movimentações

A aplicação SHALL exibir o histórico das movimentações registradas, com tipo, produto, quantidade, posição(ões) envolvida(s) e data, da mais recente para a mais antiga.

#### Scenario: Listar movimentações

- **WHEN** o usuário acessa a área de Movimentações e existem movimentações registradas
- **THEN** a lista exibe cada movimentação com tipo, produto, quantidade, posições e data, ordenadas da mais recente para a mais antiga

#### Scenario: Sem movimentações

- **WHEN** o usuário acessa a área de Movimentações e não há nenhuma registrada
- **THEN** é exibida uma mensagem indicando que não há movimentações, sem erro
