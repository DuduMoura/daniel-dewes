# orders Specification

## Purpose
TBD - created by archiving change order-picking. Update Purpose after archive.
## Requirements
### Requirement: Criação de pedido de expedição

A aplicação SHALL permitir criar um pedido de expedição informando um ou mais itens, cada um com produto e quantidade (inteiro ≥ 1). O pedido nasce no estado aberto.

#### Scenario: Criar pedido com itens

- **WHEN** o usuário informa ao menos um item (produto + quantidade) e confirma
- **THEN** um pedido aberto é criado com os itens informados

#### Scenario: Pedido sem itens

- **WHEN** o usuário tenta criar um pedido sem nenhum item
- **THEN** a criação é rejeitada com mensagem de validação

### Requirement: Indicação de localização na separação

Para cada item de um pedido aberto, a aplicação SHALL indicar as posições onde o produto tem saldo, com a quantidade disponível em cada uma.

#### Scenario: Mostrar posições do produto

- **WHEN** o operador abre a separação de um pedido
- **THEN** cada item exibe as posições com saldo do produto e a quantidade disponível

### Requirement: Confirmação de coleta por item

A aplicação SHALL permitir confirmar a coleta de cada item, registrando a posição de onde foi coletado. A confirmação SHALL exigir que a posição tenha saldo suficiente para a quantidade do item.

#### Scenario: Confirmar coleta de um item

- **WHEN** o operador escolhe uma posição com saldo suficiente e confirma a coleta de um item
- **THEN** o item passa a constar como coletado daquela posição

#### Scenario: Posição com saldo insuficiente

- **WHEN** o operador tenta confirmar a coleta de um item de uma posição cujo saldo é menor que a quantidade do item
- **THEN** a coleta é rejeitada com mensagem de saldo insuficiente

### Requirement: Expedição atômica do pedido

A aplicação SHALL permitir expedir um pedido apenas quando todos os seus itens estiverem coletados. Na expedição, de forma atômica, o saldo de cada posição coletada SHALL ser reduzido pela quantidade do item e uma movimentação de saída SHALL ser registrada para cada item; o pedido passa a expedido. Se qualquer item não tiver saldo suficiente no momento da expedição, nenhuma alteração SHALL ser persistida.

#### Scenario: Expedir pedido completo

- **WHEN** o operador expede um pedido com todos os itens coletados e saldo suficiente
- **THEN** o saldo de cada posição é reduzido, uma saída é registrada por item, e o pedido fica expedido

#### Scenario: Pedido com item não coletado

- **WHEN** o operador tenta expedir um pedido que ainda tem item sem coleta confirmada
- **THEN** a expedição é rejeitada

#### Scenario: Saldo insuficiente na expedição

- **WHEN** no momento da expedição uma das posições coletadas não tem mais saldo suficiente
- **THEN** a expedição é rejeitada e nenhum saldo ou movimentação é alterado

### Requirement: Cancelamento de pedido

A aplicação SHALL permitir cancelar um pedido aberto, sem afetar o estoque.

#### Scenario: Cancelar pedido aberto

- **WHEN** o operador cancela um pedido que está aberto
- **THEN** o pedido passa a cancelado e nenhum saldo é alterado

### Requirement: Reavaliação de alertas após a expedição

Após expedir um pedido, a aplicação SHALL reavaliar a condição de alerta de estoque mínimo dos produtos expedidos.

#### Scenario: Expedição derruba saldo abaixo do mínimo

- **WHEN** a expedição reduz o saldo total de um produto para abaixo do seu estoque mínimo
- **THEN** após a expedição existe um alerta em aberto para aquele produto

### Requirement: Listagem de pedidos

A aplicação SHALL exibir os pedidos com seu estado (aberto, expedido, cancelado) e a quantidade de itens.

#### Scenario: Listar pedidos

- **WHEN** o usuário acessa a área de Pedidos
- **THEN** os pedidos são exibidos com estado e quantidade de itens

#### Scenario: Sem pedidos

- **WHEN** o usuário acessa a área de Pedidos e não há nenhum
- **THEN** é exibida uma mensagem indicando que não há pedidos, sem erro
