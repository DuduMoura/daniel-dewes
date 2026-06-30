## Why

O projeto do WMS hoje só tem o PRD e nenhuma base técnica. Antes de implementar qualquer funcionalidade do armazém (produtos, movimentação, inventário), é preciso estabelecer uma fundação: a aplicação rodando, as decisões de arquitetura registradas e o modelo de dados do domínio criado. Sem isso, cada funcionalidade futura seria construída de forma inconsistente e sem um padrão comum.

## What Changes

- Scaffolding da aplicação **Next.js (App Router) + TypeScript** como monolito full-stack.
- Provisão do banco **PostgreSQL via Docker** e integração com **Prisma** (ORM), incluindo o modelo de dados completo do domínio derivado do PRD (produtos, fornecedores, categorias, localização área/corredor/posição, saldo por posição, movimentações, alertas de mínimo e inventário).
- Convenções de projeto: **organização por feature** (`src/modules/<feature>`), **Zod** como fonte única de validação/tipos, leitura em Server Components e escrita em Server Actions.
- **Casca da aplicação (app shell)**: navegação lateral para todas as áreas do sistema e uma página de **dashboard** com o resumo do armazém em tempo real.
- Adoção de **Tailwind CSS + shadcn/ui** para a camada visual.

Não inclui (ficam para changes seguintes): os CRUDs e fluxos de cada domínio (cadastro de produtos/fornecedores, motor de movimentação, inventário, alertas) e autenticação/RBAC.

## Capabilities

### New Capabilities
- `app-shell`: estrutura de navegação da aplicação (acesso a todas as áreas do WMS) e o dashboard com indicadores agregados do armazém (produtos cadastrados, unidades em estoque, fornecedores, alertas e inventários em aberto) refletindo o estado atual do sistema.

### Modified Capabilities
<!-- Nenhuma — não existem specs anteriores. -->

## Impact

- **Novo**: projeto Next.js, dependências (Prisma, Zod, react-hook-form, Tailwind, shadcn/ui), `docker-compose.yml` para o Postgres, schema Prisma e migration inicial.
- **Infra**: banco PostgreSQL local em container; variáveis de ambiente (`DATABASE_URL`).
- **Convenções**: documento de arquitetura para o agente (`AGENTS.md`/`CLAUDE.md`) com as regras do projeto.
- **Decisão adiada**: autenticação/RBAC (depende de definição de hospedagem); o modelo já prevê `User`/`Role` para plugar depois.
