# app-shell Specification

## Purpose
TBD - created by archiving change wms-foundation. Update Purpose after archive.
## Requirements
### Requirement: Navegação entre as áreas do sistema

A aplicação SHALL apresentar uma navegação persistente que dê acesso a todas as áreas do WMS: Dashboard, Produtos, Fornecedores, Localização, Movimentações, Inventário e Alertas. A navegação SHALL indicar visualmente a área atualmente ativa.

#### Scenario: Acesso às áreas pela navegação

- **WHEN** o usuário visualiza qualquer página da aplicação
- **THEN** a navegação exibe links para Dashboard, Produtos, Fornecedores, Localização, Movimentações, Inventário e Alertas

#### Scenario: Indicação da área ativa

- **WHEN** o usuário acessa uma área (por exemplo, Produtos)
- **THEN** o item correspondente na navegação é destacado como ativo

#### Scenario: Navegação para uma área

- **WHEN** o usuário clica em um item da navegação
- **THEN** a aplicação exibe a página da área correspondente sem recarregar a página inteira

### Requirement: Dashboard com resumo do armazém

A aplicação SHALL oferecer uma página de dashboard que apresente indicadores agregados do armazém: total de produtos cadastrados, total de unidades em estoque, total de fornecedores, quantidade de alertas em aberto e quantidade de inventários em aberto.

#### Scenario: Exibição dos indicadores

- **WHEN** o usuário acessa o dashboard
- **THEN** são exibidos os indicadores de produtos cadastrados, unidades em estoque, fornecedores, alertas em aberto e inventários em aberto

#### Scenario: Armazém sem dados

- **WHEN** o usuário acessa o dashboard e ainda não há registros no sistema
- **THEN** cada indicador é exibido com o valor zero, sem erro

#### Scenario: Destaque de alertas em aberto

- **WHEN** existem um ou mais alertas de estoque mínimo em aberto
- **THEN** o indicador de alertas é destacado visualmente

### Requirement: Indicadores refletem o estado atual

Os indicadores do dashboard SHALL refletir o estado atual dos dados do sistema a cada acesso, sem servir valores defasados de um cache estático.

#### Scenario: Atualização após mudança nos dados

- **WHEN** os dados do armazém mudam e o usuário acessa ou recarrega o dashboard
- **THEN** os indicadores apresentam os valores correspondentes ao estado atual do sistema

