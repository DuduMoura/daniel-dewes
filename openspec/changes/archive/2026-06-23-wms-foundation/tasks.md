## 1. Scaffolding do projeto

- [x] 1.1 Criar projeto Next.js (App Router, TypeScript, ESLint, src/, import alias `@/*`)
- [x] 1.2 Adicionar dependências: `zod`, `react-hook-form`, `@hookform/resolvers`
- [x] 1.3 Adicionar `.gitignore` adequado (.env, node_modules, .next, build) e `.env.example`

## 2. Banco de dados (Postgres + Docker)

- [x] 2.1 Criar `docker-compose.yml` com Postgres 16, volume persistente e healthcheck
- [x] 2.2 Definir `.env` com `DATABASE_URL` e credenciais usadas pelo compose
- [x] 2.3 Subir o container e validar que está saudável (`docker compose up -d`)

## 3. Prisma e modelo de domínio

- [x] 3.1 Instalar e inicializar Prisma + `@prisma/adapter-pg`
- [x] 3.2 Modelar o schema do domínio: `User`/`Role`, `Category`, `Supplier`, `Product`, `Area`/`Aisle`/`Position`, `StockItem`, `Movement`, `Alert`, `Inventory`/`InventoryItem`
- [x] 3.3 Gerar a migration inicial e aplicar no banco
- [x] 3.4 Criar o singleton do Prisma Client em `src/lib/db.ts` usando o driver adapter

## 4. Convenções e UI base

- [x] 4.1 Registrar as convenções de arquitetura em `AGENTS.md`/`CLAUDE.md` (stack, módulos por feature, Zod, regra de transação)
- [x] 4.2 Inicializar Tailwind + shadcn/ui e adicionar componentes base (button, card, etc.)
- [x] 4.3 Definir a estrutura de módulos por feature como padrão (ex.: módulo de exemplo com `schema.ts`/`queries.ts`/`actions.ts`)

## 5. App shell (navegação)

- [x] 5.1 Criar a navegação lateral com links para todas as áreas (Dashboard, Produtos, Fornecedores, Localização, Movimentações, Inventário, Alertas)
- [x] 5.2 Indicar visualmente a área ativa conforme a rota atual
- [x] 5.3 Integrar a navegação no root layout (pt-BR, metadata do WMS)
- [x] 5.4 Criar páginas-placeholder para as áreas ainda não implementadas (navegação sem 404)

## 6. Dashboard

- [x] 6.1 Criar a query agregada do resumo (produtos, unidades em estoque, fornecedores, alertas em aberto, inventários em aberto)
- [x] 6.2 Criar a página de dashboard exibindo os indicadores em cards
- [x] 6.3 Garantir renderização dinâmica (indicadores refletem o estado atual, sem cache estático)
- [x] 6.4 Tratar o caso sem dados (indicadores em zero, sem erro) e destacar alertas em aberto

## 7. Validação

- [x] 7.1 Rodar typecheck (`tsc --noEmit`) e build (`next build`) sem erros
- [x] 7.2 Subir o dev server e confirmar que o dashboard e todas as rotas da navegação respondem
