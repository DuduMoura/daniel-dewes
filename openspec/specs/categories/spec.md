# categories Specification

## Purpose
TBD - created by archiving change product-management. Update Purpose after archive.
## Requirements
### Requirement: Criação de categoria

A aplicação SHALL permitir criar uma categoria informando um nome. O nome da categoria SHALL ser obrigatório e único.

#### Scenario: Criar categoria válida

- **WHEN** o usuário informa um nome de categoria inédito e confirma
- **THEN** a categoria é criada e fica disponível para classificar produtos

#### Scenario: Nome de categoria duplicado

- **WHEN** o usuário tenta criar uma categoria com um nome já existente
- **THEN** a criação é rejeitada e é informado que o nome já está em uso

#### Scenario: Nome ausente

- **WHEN** o usuário tenta criar uma categoria sem informar o nome
- **THEN** a criação é rejeitada com mensagem de validação

### Requirement: Listagem de categorias

A aplicação SHALL disponibilizar a lista de categorias existentes para seleção no cadastro/edição de produtos.

#### Scenario: Selecionar categoria no produto

- **WHEN** o usuário cadastra ou edita um produto
- **THEN** é possível escolher uma das categorias existentes para o produto

