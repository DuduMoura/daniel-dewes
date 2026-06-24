## Why

O projeto precisa ficar previsível em ambientes locais e de build. Hoje há dois pontos de instabilidade:

- o `next build` falha sem acesso externo porque o layout importa fontes via `next/font/google`
- alguns formulários usam `watch()` do `react-hook-form`, o que gera warnings do React Compiler e faz a compilação otimizada ser ignorada nesses componentes

Isso não altera fluxo funcional do WMS, mas melhora robustez operacional e reduz erros inesperados durante desenvolvimento e entrega.

## What Changes

- Remover a dependência de Google Fonts no shell da aplicação, usando uma pilha local/system font estável
- Ajustar formulários cliente para observar campos com `useWatch`, evitando warnings do React Compiler
- Validar novamente `lint`, typecheck e `build`

## Capabilities

### Modified Capabilities
- `app-shell`: o shell deve conseguir compilar sem depender de rede externa para tipografia
- `form-runtime`: formulários interativos devem permanecer compatíveis com o pipeline de compilação adotado pelo projeto

## Impact

- **Build**: passa a ser autocontido no que diz respeito à tipografia
- **UI**: mantém aparência consistente com fontes locais, sem acoplamento à rede
- **Frontend**: componentes com `react-hook-form` deixam de disparar warnings atuais do compilador
