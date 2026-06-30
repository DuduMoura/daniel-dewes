## Context

O WMS está no estágio inicial: existe apenas o PRD (problema, perfis e os 5 fluxos) e nenhuma base técnica. Esta change estabelece a fundação sobre a qual todas as funcionalidades serão construídas. As decisões aqui valem como contrato para as próximas changes (CRUDs, movimentação, inventário, alertas).

Restrições conhecidas:
- O PRD é puramente funcional; nenhuma escolha de stack/hospedagem está definida por ele.
- A hospedagem ainda não foi decidida, o que adia autenticação/RBAC.
- O domínio exige integridade transacional no estoque (saldo não pode ficar inconsistente).

## Goals / Non-Goals

**Goals:**
- Aplicação Next.js rodando localmente com banco PostgreSQL provisionado.
- Modelo de dados completo do domínio (do PRD) criado via Prisma e migration.
- Convenções de arquitetura registradas e aplicáveis pelo agente.
- App shell navegável (todas as áreas) e dashboard com resumo em tempo real.

**Non-Goals:**
- CRUDs e fluxos de cada domínio (produtos, fornecedores, movimentação, inventário, alertas) — entram em changes seguintes.
- Autenticação e RBAC.
- Definição de hospedagem/deploy.
- Cron/serviço de geração automática de alertas (a tabela `Alert` é criada, mas a regra de geração é de change futura).

## Decisions

### Monolito full-stack em Next.js (App Router)
Front e back no mesmo projeto, usando Server Components (leitura) e Server Actions (escrita). **Por quê:** o domínio não justifica microserviços; type-safety ponta a ponta e menos infra. **Alternativa descartada:** API separada (Nest/Express) + SPA — adiciona complexidade sem necessidade atual (não há app mobile nem múltiplos consumidores).

### PostgreSQL via Docker
Banco relacional em container (`docker-compose.yml`). **Por quê:** movimentação de estoque exige transações ACID; o modelo é fortemente relacional (produto → posição → movimento). Docker evita configuração manual e padroniza o ambiente. **Alternativa descartada:** SQLite (sem robustez transacional/concorrência para o caso) e Postgres gerenciado em nuvem (depende de hospedagem, ainda indefinida).

### Prisma como ORM
Migrations versionadas, schema tipado e API de transação (`prisma.$transaction`). **Por quê:** integra bem com TypeScript/Next e cobre a necessidade transacional. **Nota:** Prisma 7 exige driver adapter — usar `@prisma/adapter-pg`. **Alternativa considerada:** Drizzle (mais SQL-first/leve), preterido por maturidade de tooling e migrations.

### Zod como fonte única de validação e tipos
Schemas Zod definem os inputs; tipos derivam via `z.infer`. O mesmo schema valida no formulário (client) e dentro da Server Action (server) antes de tocar no banco. **Por quê:** elimina duplicação tipo/validação e garante validação no servidor. Combina com `react-hook-form` via `@hookform/resolvers`.

### Organização por feature
`src/modules/<feature>/` com `schema.ts` (Zod), `queries.ts` (leitura), `actions.ts` (mutação) e `components/`. **Por quê:** domínios bem separados (produtos, movimentação, inventário…), facilita evolução isolada (colocation recomendada pelo Next). **Alternativa descartada:** organização por camada técnica (services/repositories), menos aderente a apps de múltiplos domínios.

### Modelo de dados (domínio do PRD)
Entidades e relações principais:
- `User` (enum `Role`: GESTOR, OPERADOR, COMPRAS) — criado já para uso futuro de auth.
- `Category`, `Supplier`, `Product` (com `minStock`, `sku`); `Supplier`↔`Product` N:N.
- Localização hierárquica: `Area` → `Aisle` (corredor) → `Position`.
- `StockItem` (`productId` + `positionId`, único) — **saldo por posição**; o saldo total é a soma das posições (estoque em tempo real).
- `Movement` (enum: ENTRADA, SAIDA, DEVOLUCAO, TRANSFERENCIA) com `fromPosition`/`toPosition`/`supplier`/`user` conforme o tipo.
- `Alert` (estoque mínimo, status ABERTO/RESOLVIDO).
- `Inventory` + `InventoryItem` (saldo do sistema × contagem física, com diferença).

**Regra de ouro (vale para changes futuras):** toda movimentação de estoque grava o `Movement` e ajusta o(s) `StockItem` dentro de uma única `prisma.$transaction`, garantindo atomicidade do saldo.

### Dashboard dinâmico
A página de dashboard usa renderização dinâmica (não cache estático) para refletir o estado atual a cada acesso, atendendo ao requisito de indicadores atualizados.

### UI: Tailwind + shadcn/ui
Componentes próprios (código no repo), acessíveis (Radix). **Por quê:** app operacional com muitas tabelas/formulários; controle total sobre os componentes.

## Risks / Trade-offs

- **Prisma 7 exige driver adapter** → usar `@prisma/adapter-pg` no client singleton (`src/lib/db.ts`); validar no build/typecheck.
- **Dashboard dinâmico tem custo por requisição** (consulta o banco sempre) → aceitável no escopo; otimizar com revalidação por tag se necessário no futuro.
- **Modelo amplo criado de uma vez** (entidades de features futuras) → risco de ajuste de schema depois; mitigado por migrations versionadas do Prisma.
- **Auth adiada** → áreas ficam abertas nesta fase; mitigado por já existir `User`/`Role` para plugar Auth.js sem refatorar o modelo.

## Migration Plan

1. Subir o Postgres via Docker (`docker compose up -d`).
2. Aplicar a migration inicial do Prisma (`prisma migrate dev`).
3. Rollback: `docker compose down -v` remove o banco; o schema é recriável pelas migrations versionadas.

## Open Questions

- Hospedagem (nuvem vs. on-premise) — define estratégia de cron de alertas e de auth; fora do escopo desta change.
- Estratégia definitiva de autenticação/RBAC (Auth.js self-hosted vs. serviço gerenciado).
