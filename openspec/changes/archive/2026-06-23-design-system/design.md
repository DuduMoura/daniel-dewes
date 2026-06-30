## Context

O app-shell ja existe (Next.js App Router + shadcn/ui + Tailwind v4). Este documento registra as decisoes visuais aplicadas seguindo a referencia "Apex" (dashboardpack, template pago — usado apenas como inspiracao de direcao visual) e o starter gratuito Kiranism como referencia de estrutura. A implementacao vive no codigo; isto e o registro fonte-de-verdade.

## Goals / Non-Goals

**Goals:** tokens consistentes, shell reutilizavel, componentes padronizados que toda tela herda.

**Non-Goals:** copiar codigo do template pago Apex; mudar a arquitetura; autenticacao.

## Decisions

- **Tokens em OKLCH** no `globals.css` (`:root` para claro, `.dark` para escuro). Valores-chave:
  - `--primary`: `oklch(0.648 0.17 150)` (claro) / `oklch(0.696 0.17 150)` (escuro); foreground branco.
  - Sidebar: fundo `oklch(0.205 0.012 160)` (claro) / `oklch(0.18 0.012 160)` (escuro); foreground `oklch(0.87 0.012 160)`; accent ativo `oklch(0.27 0.03 158)`; primary esmeralda.
  - Charts: `0.70 0.16 150` / `0.72 0.12 195` / `0.62 0.19 256` / `0.62 0.20 300` / `0.77 0.16 75` (verde, teal, azul, violeta, ambar).
  - `--ring` esmeralda; raio base `0.625rem`.
  - Alternativa considerada: aplicar um preset do tweakcn. Preferi editar os tokens direto por ser mais transparente e versionavel.
- **Sidebar** (`src/components/app-sidebar.tsx`): escura, agrupada (Visao geral / Operacao / Cadastros), logo em badge esmeralda, item ativo com barra + icone verde. Usa tokens `--sidebar-*`, nao cores globais, para ler bem no escuro.
- **Componentes**: shadcn/ui em `src/components/ui`.
- **Lib de graficos: Recharts** (via componente `chart` do shadcn). Decidido em favor do Recharts (e nao Tremor) porque o componente oficial de graficos do shadcn e construido sobre Recharts e consome exatamente os tokens `--chart-1..5` ja definidos aqui; Tremor traria um sistema de estilo proprio que conflitaria com esses tokens. A *implementacao* dos graficos (componente `ui/chart.tsx` + uso) fica para a change do dashboard; aqui apenas fixamos a lib.

## Risks / Trade-offs

- [Divergencia visual em telas novas] -> mitigado pelo `config.yaml` rules que injeta a regra em toda geracao, somado a esta spec.
- [Contraste no modo escuro] -> tokens definidos para `:root` e `.dark`; revisar ao adicionar telas.

## Migration Plan

Ja aplicado; sem migracao. Telas novas devem consumir os tokens e o shell.

## Open Questions

- ~~Lib de graficos definitiva (Recharts vs Tremor)~~ — **resolvido: Recharts** (via shadcn `chart`), ver Decisions. A implementacao dos graficos fica para a change do dashboard.
