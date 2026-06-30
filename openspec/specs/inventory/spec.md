# inventory Specification

## Purpose
TBD - created by archiving change physical-inventory. Update Purpose after archive.
## Requirements
### Requirement: Abertura de inventário com snapshot do saldo

A aplicação SHALL permitir abrir um inventário, opcionalmente restrito a uma ou mais áreas. Na abertura, o sistema SHALL registrar, para cada par produto/posição no escopo, a quantidade atualmente em estoque como saldo de sistema (snapshot). SHALL existir no máximo um inventário aberto por vez.

#### Scenario: Abrir inventário do armazém inteiro

- **WHEN** o gestor abre um inventário sem selecionar área e existe estoque registrado
- **THEN** o inventário é criado com um item para cada par produto/posição com saldo, registrando o saldo de sistema de cada um

#### Scenario: Abrir inventário restrito a área

- **WHEN** o gestor abre um inventário selecionando uma área
- **THEN** apenas os pares produto/posição daquela área entram no inventário

#### Scenario: Já existe inventário aberto

- **WHEN** o gestor tenta abrir um inventário enquanto outro está aberto
- **THEN** a abertura é rejeitada com mensagem indicando que já há um inventário em andamento

### Requirement: Registro da contagem física

A aplicação SHALL permitir informar a quantidade física contada de cada item do inventário aberto, calculando a diferença em relação ao saldo de sistema registrado na abertura.

#### Scenario: Informar contagem

- **WHEN** o operador informa a quantidade contada de um item
- **THEN** o item passa a exibir a quantidade contada e a diferença (contado − saldo de sistema)

#### Scenario: Contagem igual ao sistema

- **WHEN** a quantidade contada de um item é igual ao saldo de sistema
- **THEN** a diferença é zero e o item não é marcado como divergente

### Requirement: Destaque de divergências

A aplicação SHALL destacar os itens cuja quantidade contada difere do saldo de sistema, para revisão.

#### Scenario: Item com divergência

- **WHEN** a quantidade contada de um item difere do saldo de sistema
- **THEN** o item é destacado como divergente, mostrando a diferença

### Requirement: Encerramento com ajuste de saldo

A aplicação SHALL permitir encerrar o inventário aberto. No encerramento, para cada item contado o saldo do estoque (`StockItem`) daquela posição SHALL ser ajustado para a quantidade contada, de forma atômica, e o inventário SHALL passar a fechado registrando o momento do encerramento. Itens não contados não SHALL ter o saldo alterado.

#### Scenario: Encerrar ajustando divergências

- **WHEN** o gestor encerra um inventário com itens contados que divergiam
- **THEN** o saldo de cada posição contada passa a ser a quantidade contada e o inventário fica fechado com a data de encerramento

#### Scenario: Atomicidade do encerramento

- **WHEN** ocorre um erro ao ajustar o saldo durante o encerramento
- **THEN** nenhum ajuste é persistido e o inventário permanece aberto

#### Scenario: Item não contado

- **WHEN** o gestor encerra um inventário em que um item não recebeu contagem
- **THEN** o saldo daquele item permanece inalterado

### Requirement: Reavaliação de alertas após o encerramento

Após encerrar um inventário, a aplicação SHALL reavaliar a condição de alerta de estoque mínimo dos produtos cujo saldo foi ajustado.

#### Scenario: Ajuste cruza o mínimo

- **WHEN** um ajuste de inventário deixa o saldo total de um produto abaixo do seu estoque mínimo
- **THEN** após o encerramento existe um alerta em aberto para aquele produto

### Requirement: Histórico de inventários

A aplicação SHALL exibir o inventário em aberto (quando houver) e o histórico de inventários encerrados.

#### Scenario: Sem inventário aberto

- **WHEN** o usuário acessa a área de Inventário e não há inventário aberto
- **THEN** é exibida a opção de abrir um novo inventário e o histórico dos encerrados

#### Scenario: Com inventário aberto

- **WHEN** o usuário acessa a área de Inventário e há um inventário aberto
- **THEN** é exibida a planilha de contagem com os itens, saldos de sistema, contagens e diferenças
