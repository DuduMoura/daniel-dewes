## MODIFIED Requirements

### Requirement: Shell compila sem dependência externa obrigatória de tipografia

A aplicação SHALL conseguir completar o processo de build usando apenas assets disponíveis no repositório e no ambiente local, sem exigir acesso de rede a um provedor de fontes para renderizar a tipografia base.

#### Scenario: Build sem acesso externo

- **WHEN** o ambiente executa o build da aplicação sem acesso à internet
- **THEN** o shell da aplicação compila com sucesso e mantém tipografia funcional usando fontes locais
