## Why

A identidade visual (estilo "Apex": acento esmeralda + sidebar escura) já foi aplicada ao app-shell. Para garantir que toda tela futura siga esse padrão em vez de divergir, o design system precisa ser a fonte de verdade documentada que todas as changes de front-end herdam.

## What Changes

- Documenta o design system como capability: tokens de design (primária esmeralda, sidebar escura, paleta de gráficos), o layout app-shell (sidebar + conteúdo) e a biblioteca de componentes (shadcn/ui).
- Estabelece que toda change de front-end reusa este shell e estes tokens.
- Sem nova regra de negócio; isto captura e padroniza a fundação visual já existente.

## Capabilities

### New Capabilities

- `design-system`: tokens, layout shell e biblioteca de componentes que todas as telas seguem.

### Modified Capabilities

<!-- Nenhuma. -->

## Impact

- Tokens em `src/app/globals.css`; shell em `src/components/app-sidebar.tsx` + `src/app/layout.tsx`; primitivos em `src/components/ui`.
- `openspec/config.yaml` passa a referenciar este design-system em toda geração de artefato.
