## ADDED Requirements

### Requirement: Formulários interativos compatíveis com o pipeline de compilação

Os formulários cliente SHALL observar mudanças de campo por mecanismos compatíveis com o pipeline de compilação adotado pelo projeto, sem depender de padrões que façam o compilador ignorar otimizações do componente.

#### Scenario: Campos observados em UI condicional

- **WHEN** um formulário observa campos para controlar selects, mensagens ou trechos condicionais da interface
- **THEN** ele usa uma API compatível com o compilador atual e não gera warnings conhecidos dessa integração
