# products Specification

## Purpose
TBD - created by archiving change product-management. Update Purpose after archive.
## Requirements
### Requirement: Listagem de produtos

A aplicação SHALL exibir, na área de Produtos, a lista de produtos cadastrados com SKU, nome, categoria, estoque mínimo e saldo total atual.

#### Scenario: Listar produtos cadastrados

- **WHEN** o usuário acessa a área de Produtos e existem produtos cadastrados
- **THEN** a lista exibe cada produto com SKU, nome, categoria, estoque mínimo e saldo total atual

#### Scenario: Lista vazia

- **WHEN** o usuário acessa a área de Produtos e não há produtos cadastrados
- **THEN** é exibida uma mensagem indicando que não há produtos, sem erro

### Requirement: Cadastro de produto

A aplicação SHALL permitir cadastrar um produto informando SKU, nome, descrição (opcional), categoria (opcional) e estoque mínimo. O SKU SHALL ser único e nome e SKU SHALL ser obrigatórios. O estoque mínimo SHALL ser um inteiro maior ou igual a zero.

#### Scenario: Cadastro com dados válidos

- **WHEN** o usuário preenche SKU, nome e estoque mínimo válidos e confirma o cadastro
- **THEN** o produto é criado e passa a aparecer na lista

#### Scenario: Campos obrigatórios ausentes

- **WHEN** o usuário tenta cadastrar sem SKU ou sem nome
- **THEN** o cadastro é rejeitado e são exibidas mensagens de validação nos campos faltantes

#### Scenario: SKU duplicado

- **WHEN** o usuário tenta cadastrar um produto com um SKU já existente
- **THEN** o cadastro é rejeitado e é informado que o SKU já está em uso

#### Scenario: Estoque mínimo inválido

- **WHEN** o usuário informa um estoque mínimo negativo
- **THEN** o cadastro é rejeitado com mensagem de validação

### Requirement: Edição de produto

A aplicação SHALL permitir editar os dados de um produto existente, aplicando as mesmas validações do cadastro.

#### Scenario: Edição com dados válidos

- **WHEN** o usuário altera os dados de um produto com valores válidos e confirma
- **THEN** o produto é atualizado e a lista reflete os novos dados

#### Scenario: Edição inválida

- **WHEN** o usuário tenta salvar uma edição com dados inválidos (ex.: nome vazio)
- **THEN** a alteração é rejeitada com mensagens de validação

### Requirement: Remoção de produto

A aplicação SHALL permitir remover um produto cadastrado.

#### Scenario: Remoção confirmada

- **WHEN** o usuário confirma a remoção de um produto
- **THEN** o produto é removido e deixa de aparecer na lista

### Requirement: Busca de produtos

A aplicação SHALL permitir buscar produtos por nome ou por categoria para localização rápida.

#### Scenario: Busca por nome

- **WHEN** o usuário informa um termo de busca correspondente ao nome de um produto
- **THEN** a lista é filtrada para exibir apenas os produtos que correspondem ao termo

#### Scenario: Busca por categoria

- **WHEN** o usuário filtra por uma categoria
- **THEN** a lista exibe apenas os produtos daquela categoria

