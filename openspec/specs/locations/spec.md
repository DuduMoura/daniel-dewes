# locations Specification

## Purpose
TBD - created by archiving change location-management. Update Purpose after archive.
## Requirements
### Requirement: Visualização da hierarquia do armazém

A aplicação SHALL exibir, na área de Localização, a hierarquia física do armazém: as áreas cadastradas, os corredores de cada área e a quantidade de posições de cada corredor.

#### Scenario: Listar a hierarquia

- **WHEN** o usuário acessa a área de Localização e existem áreas cadastradas
- **THEN** cada área é exibida com seus corredores, e cada corredor com a quantidade de posições

#### Scenario: Armazém vazio

- **WHEN** o usuário acessa a área de Localização e não há áreas cadastradas
- **THEN** é exibida uma mensagem indicando que não há localizações, sem erro

### Requirement: Cadastro de área

A aplicação SHALL permitir cadastrar uma área informando código (obrigatório, único) e nome (obrigatório).

#### Scenario: Cadastro com dados válidos

- **WHEN** o usuário informa código e nome e confirma
- **THEN** a área é criada e passa a aparecer na hierarquia

#### Scenario: Código de área duplicado

- **WHEN** o usuário tenta cadastrar uma área com um código já existente
- **THEN** o cadastro é rejeitado com mensagem de validação no campo código

#### Scenario: Campo obrigatório ausente

- **WHEN** o usuário tenta cadastrar uma área sem código ou sem nome
- **THEN** o cadastro é rejeitado com mensagem de validação

### Requirement: Cadastro de corredor

A aplicação SHALL permitir cadastrar um corredor dentro de uma área, informando o código (obrigatório, único dentro da área). O corredor SHALL pertencer a exatamente uma área.

#### Scenario: Cadastro com dados válidos

- **WHEN** o usuário seleciona uma área, informa o código do corredor e confirma
- **THEN** o corredor é criado sob aquela área

#### Scenario: Código de corredor duplicado na mesma área

- **WHEN** o usuário tenta cadastrar um corredor com código já existente dentro da mesma área
- **THEN** o cadastro é rejeitado com mensagem de validação no campo código

### Requirement: Cadastro de posição

A aplicação SHALL permitir cadastrar uma posição dentro de um corredor, informando o código (obrigatório, único dentro do corredor). A posição SHALL pertencer a exatamente um corredor.

#### Scenario: Cadastro com dados válidos

- **WHEN** o usuário seleciona um corredor, informa o código da posição e confirma
- **THEN** a posição é criada sob aquele corredor

#### Scenario: Código de posição duplicado no mesmo corredor

- **WHEN** o usuário tenta cadastrar uma posição com código já existente dentro do mesmo corredor
- **THEN** o cadastro é rejeitado com mensagem de validação no campo código

### Requirement: Edição de localização

A aplicação SHALL permitir editar o código (e, no caso da área, o nome) de uma área, corredor ou posição existente, aplicando as mesmas validações de unicidade do cadastro.

#### Scenario: Edição com dados válidos

- **WHEN** o usuário altera os dados de uma localização com valores válidos e confirma
- **THEN** a localização é atualizada e a hierarquia reflete os novos dados

#### Scenario: Edição gera código duplicado

- **WHEN** o usuário altera o código de uma localização para um valor que colide com outra do mesmo nível/pai
- **THEN** a edição é rejeitada com mensagem de validação no campo código

### Requirement: Remoção protegida de localização

A aplicação SHALL permitir remover uma localização apenas quando ela não possui dependentes. Uma área com corredores, um corredor com posições, ou uma posição com estoque, movimentações ou itens de inventário vinculados NÃO SHALL ser removida.

#### Scenario: Remoção de localização sem dependentes

- **WHEN** o usuário confirma a remoção de uma localização que não tem filhos nem vínculos
- **THEN** a localização é removida e deixa de aparecer na hierarquia

#### Scenario: Remoção bloqueada por dependentes

- **WHEN** o usuário tenta remover uma área com corredores, um corredor com posições, ou uma posição com estoque/movimentação/inventário vinculado
- **THEN** a remoção é rejeitada com uma mensagem explicando o vínculo, e nada é apagado
