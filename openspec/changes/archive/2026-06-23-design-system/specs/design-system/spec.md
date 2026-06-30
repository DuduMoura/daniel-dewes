## ADDED Requirements

### Requirement: Identidade visual esmeralda
The system SHALL apply an emerald primary accent and a dark sidebar across the entire application, defined as design tokens in `src/app/globals.css` for both light and dark modes.

#### Scenario: Acento primario
- **WHEN** um elemento primario (botao, indicador ativo, anel de foco) e renderizado
- **THEN** ele usa a cor `--primary` esmeralda definida nos tokens

#### Scenario: Sidebar escura
- **WHEN** qualquer pagina da aplicacao e exibida
- **THEN** a sidebar aparece com fundo escuro e texto claro, nos modos claro e escuro

### Requirement: Layout app-shell persistente
The system SHALL render every screen inside the shared app-shell, composed of a navigation sidebar and a content area.

#### Scenario: Navegacao consistente
- **WHEN** o usuario acessa qualquer rota (produtos, movimentacoes, inventario, etc.)
- **THEN** a sidebar agrupada (Visao geral, Operacao, Cadastros) e exibida

#### Scenario: Indicacao de item ativo
- **WHEN** uma rota esta ativa
- **THEN** o item correspondente recebe destaque com barra e icone esmeralda

### Requirement: Biblioteca de componentes padrao
The system SHALL build its UI from the shared shadcn/ui primitives in `src/components/ui`, styled by the design tokens, instead of ad-hoc components.

#### Scenario: Reuso de componentes
- **WHEN** uma nova tela precisa de tabela, card, botao, input ou dialogo
- **THEN** ela usa os componentes existentes em `src/components/ui`

### Requirement: Biblioteca de graficos padrao
The system SHALL render data visualizations with Recharts via the shadcn `chart` component, colored exclusively by the `--chart-1..5` design tokens, instead of ad-hoc charting libraries.

#### Scenario: Grafico segue os tokens
- **WHEN** uma tela (ex.: dashboard) exibe um grafico
- **THEN** ele e construido com Recharts/shadcn `chart` e usa as cores `--chart-1..5` definidas nos tokens

#### Scenario: Lib unica de graficos
- **WHEN** uma nova tela precisa de visualizacao de dados
- **THEN** ela usa Recharts (shadcn `chart`), sem introduzir outra biblioteca de graficos
