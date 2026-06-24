# alerts Specification

## Purpose
TBD - created by archiving change min-stock-alerts. Update Purpose after archive.
## Requirements
### Requirement: Geração de alerta de estoque mínimo

A aplicação SHALL gerar um alerta em aberto para um produto quando seu saldo total (soma do estoque em todas as posições) fica abaixo do estoque mínimo definido e ainda não existe alerta em aberto para ele. Cada produto SHALL ter no máximo um alerta em aberto por vez.

#### Scenario: Saldo cai abaixo do mínimo

- **WHEN** o saldo total de um produto fica abaixo do seu estoque mínimo e não há alerta em aberto para ele
- **THEN** um alerta em aberto é criado registrando a quantidade atual e o mínimo

#### Scenario: Já existe alerta em aberto

- **WHEN** o saldo de um produto continua abaixo do mínimo e já existe um alerta em aberto para ele
- **THEN** nenhum alerta novo é criado e a quantidade atual do alerta existente é atualizada

### Requirement: Resolução automática de alerta

A aplicação SHALL resolver automaticamente o alerta em aberto de um produto quando seu saldo total volta a ser maior ou igual ao estoque mínimo.

#### Scenario: Saldo se recupera

- **WHEN** o saldo total de um produto com alerta em aberto volta a ser maior ou igual ao mínimo
- **THEN** o alerta passa a resolvido e registra o momento da resolução

### Requirement: Reavaliação após movimentação

A aplicação SHALL reavaliar a condição de alerta de um produto após cada movimentação de estoque que o afete.

#### Scenario: Saída derruba o saldo abaixo do mínimo

- **WHEN** uma saída (ou transferência/devolução a fornecedor) reduz o saldo total de um produto para abaixo do mínimo
- **THEN** ao concluir a movimentação, um alerta em aberto passa a existir para aquele produto

#### Scenario: Entrada recompõe o saldo

- **WHEN** uma entrada eleva o saldo total de um produto que tinha alerta em aberto para o mínimo ou acima
- **THEN** ao concluir a movimentação, o alerta daquele produto é resolvido

### Requirement: Listagem de alertas em aberto

A aplicação SHALL exibir, na área de Alertas, os alertas em aberto com o produto, a quantidade atual, o estoque mínimo e os fornecedores do produto.

#### Scenario: Listar alertas em aberto

- **WHEN** o usuário acessa a área de Alertas e existem alertas em aberto
- **THEN** cada alerta é exibido com produto, quantidade atual, mínimo e os fornecedores correspondentes

#### Scenario: Sem alertas

- **WHEN** o usuário acessa a área de Alertas e nenhum produto está abaixo do mínimo
- **THEN** é exibida uma mensagem indicando que não há alertas em aberto, sem erro
