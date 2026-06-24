# suppliers Specification

## Purpose
TBD - created by archiving change supplier-management. Update Purpose after archive.
## Requirements
### Requirement: Listagem de fornecedores

A aplicação SHALL exibir, na área de Fornecedores, a lista de fornecedores cadastrados com nome, contato (email/telefone) e a quantidade de produtos fornecidos.

#### Scenario: Listar fornecedores cadastrados

- **WHEN** o usuário acessa a área de Fornecedores e existem fornecedores cadastrados
- **THEN** a lista exibe cada fornecedor com nome, dados de contato e a quantidade de produtos fornecidos

#### Scenario: Lista vazia

- **WHEN** o usuário acessa a área de Fornecedores e não há fornecedores cadastrados
- **THEN** é exibida uma mensagem indicando que não há fornecedores, sem erro

### Requirement: Cadastro de fornecedor

A aplicação SHALL permitir cadastrar um fornecedor informando nome (obrigatório), email, telefone e contato (opcionais). Quando informado, o email SHALL ter formato válido.

#### Scenario: Cadastro com dados válidos

- **WHEN** o usuário informa um nome e confirma o cadastro
- **THEN** o fornecedor é criado e passa a aparecer na lista

#### Scenario: Nome ausente

- **WHEN** o usuário tenta cadastrar sem informar o nome
- **THEN** o cadastro é rejeitado com mensagem de validação

#### Scenario: Email inválido

- **WHEN** o usuário informa um email em formato inválido
- **THEN** o cadastro é rejeitado com mensagem de validação no campo email

### Requirement: Edição de fornecedor

A aplicação SHALL permitir editar os dados de um fornecedor existente, aplicando as mesmas validações do cadastro.

#### Scenario: Edição com dados válidos

- **WHEN** o usuário altera os dados de um fornecedor com valores válidos e confirma
- **THEN** o fornecedor é atualizado e a lista reflete os novos dados

### Requirement: Remoção de fornecedor

A aplicação SHALL permitir remover um fornecedor cadastrado.

#### Scenario: Remoção confirmada

- **WHEN** o usuário confirma a remoção de um fornecedor
- **THEN** o fornecedor é removido e deixa de aparecer na lista

### Requirement: Associação de produtos fornecidos

A aplicação SHALL permitir definir quais produtos um fornecedor fornece, selecionando-os a partir dos produtos cadastrados. A associação SHALL poder ser alterada na edição do fornecedor.

#### Scenario: Associar produtos ao fornecedor

- **WHEN** o usuário seleciona um ou mais produtos ao cadastrar ou editar um fornecedor e confirma
- **THEN** os produtos selecionados passam a constar como fornecidos por aquele fornecedor

#### Scenario: Remover associação de produto

- **WHEN** o usuário desmarca um produto antes associado e confirma
- **THEN** aquele produto deixa de constar como fornecido por aquele fornecedor

### Requirement: Busca de fornecedores

A aplicação SHALL permitir buscar fornecedores por nome para localização rápida.

#### Scenario: Busca por nome

- **WHEN** o usuário informa um termo de busca correspondente ao nome de um fornecedor
- **THEN** a lista é filtrada para exibir apenas os fornecedores que correspondem ao termo
