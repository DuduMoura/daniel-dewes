## ADDED Requirements

### Requirement: Acesso à consulta de um produto

A aplicação SHALL permitir abrir a consulta de um produto a partir da listagem de produtos (que já oferece busca por nome e categoria).

#### Scenario: Abrir o detalhe pelo nome

- **WHEN** o usuário aciona o nome de um produto na listagem
- **THEN** a aplicação exibe a consulta daquele produto

#### Scenario: Produto inexistente

- **WHEN** o usuário acessa a consulta de um produto que não existe
- **THEN** a aplicação responde com "não encontrado"

### Requirement: Visão geral do produto na consulta

A aplicação SHALL exibir, na consulta de um produto, o nome, o SKU, a categoria, o estoque mínimo e o saldo total atual, destacando o saldo quando estiver abaixo do mínimo.

#### Scenario: Saldo abaixo do mínimo

- **WHEN** o saldo total do produto consultado está abaixo do estoque mínimo
- **THEN** o saldo é exibido com destaque de alerta

#### Scenario: Saldo adequado

- **WHEN** o saldo total do produto consultado é maior ou igual ao mínimo
- **THEN** o saldo é exibido sem destaque de alerta

### Requirement: Distribuição por posição

A aplicação SHALL exibir, na consulta de um produto, as posições do armazém onde ele tem saldo, com o endereço (área/corredor/posição) e a quantidade em cada uma.

#### Scenario: Produto guardado em posições

- **WHEN** o produto consultado tem saldo em uma ou mais posições
- **THEN** cada posição é listada com seu endereço e a respectiva quantidade

#### Scenario: Produto sem estoque

- **WHEN** o produto consultado não tem saldo em nenhuma posição
- **THEN** é exibida uma indicação de que não há estoque em nenhuma posição

### Requirement: Histórico de movimentações do produto

A aplicação SHALL exibir, na consulta de um produto, o histórico recente de movimentações daquele produto (entradas, saídas, devoluções e transferências), da mais recente para a mais antiga.

#### Scenario: Produto com movimentações

- **WHEN** o produto consultado possui movimentações registradas
- **THEN** o histórico exibe as movimentações recentes com tipo, quantidade, posições e data

#### Scenario: Produto sem movimentações

- **WHEN** o produto consultado não possui movimentações
- **THEN** é exibida uma indicação de que não há movimentações para o produto
