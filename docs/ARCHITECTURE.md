# 🏗️ Arquitetura do Sistema — SistemaWMS

## Visão Geral

O SistemaWMS é uma aplicação web monolítica construída sobre o **Next.js 15** utilizando o **Pages Router**. A arquitetura segue o padrão **MVC adaptado para Next.js**, onde as API Routes funcionam como controllers, o Prisma como camada de acesso a dados (Model) e os componentes React como Views.

---

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTE (Browser)                          │
│                                                                     │
│   ┌───────────────────┐        ┌──────────────────────────────┐    │
│   │   Páginas React   │        │       TanStack Query         │    │
│   │  (pages/*.tsx)    │◄──────►│  (cache / estado assíncrono) │    │
│   └────────┬──────────┘        └──────────────────────────────┘    │
│            │ HTTP / fetch                                           │
└────────────┼────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVIDOR (Next.js)                          │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      API Routes (pages/api)                   │  │
│  │                                                              │  │
│  │  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐  │  │
│  │  │  /auth/*     │  │  /produtos/*  │  │  /estoque/*     │  │  │
│  │  │  NextAuth    │  │  CRUD         │  │  Movimentações  │  │  │
│  │  └──────┬───────┘  └──────┬────────┘  └────────┬────────┘  │  │
│  │         │                 │                     │           │  │
│  │         └─────────────────┼─────────────────────┘           │  │
│  │                           │                                  │  │
│  │              ┌────────────▼────────────┐                    │  │
│  │              │      Middleware          │                    │  │
│  │              │  (Auth + Autorização     │                    │  │
│  │              │   por Role via Zod)      │                    │  │
│  │              └────────────┬────────────┘                    │  │
│  └───────────────────────────┼──────────────────────────────────┘  │
│                              │                                      │
│  ┌───────────────────────────▼──────────────────────────────────┐  │
│  │                    Camada de Serviço (lib/)                   │  │
│  │                                                              │  │
│  │         ┌─────────────────┐   ┌──────────────────┐          │  │
│  │         │   prisma.ts     │   │   logging.ts     │          │  │
│  │         │  (PrismaClient) │   │  (Audit Logs)    │          │  │
│  │         └────────┬────────┘   └──────────────────┘          │  │
│  └──────────────────┼───────────────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────────────┘
                      │ Prisma ORM (SQL)
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        BANCO DE DADOS                               │
│                       PostgreSQL 15+                                │
│                                                                     │
│   Usuario  ◄──────  Sessao / Conta / TokenVerificacao              │
│      │                                                              │
│      ├──────────────► Log                                          │
│      │                                                              │
│      └──────────────► MovimentacaoEstoque ◄────── Produto          │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Camadas da Aplicação

### 1. Apresentação (View) — `pages/*.tsx`

Componentes React responsáveis pela interface do usuário. Utilizam:
- **React Hook Form + Zod** para validação de formulários no cliente
- **TanStack Query** para busca, cache e mutação de dados assíncronos
- **Tailwind CSS** para estilização

### 2. Controle (Controller) — `pages/api/*.ts`

API Routes do Next.js que expõem endpoints RESTful. Responsabilidades:
- Verificação de autenticação via `getServerSession`
- Controle de autorização por `UsuarioRole`
- Validação de payload com **Zod**
- Delegação para a camada de dados via **Prisma**
- Criação de **logs de auditoria** em cada operação

### 3. Dados (Model) — `prisma/schema.prisma` + `lib/prisma.ts`

Camada de acesso ao banco de dados via **Prisma ORM**. Características:
- Transações atômicas (`prisma.$transaction`) para operações críticas
- Singleton do `PrismaClient` para evitar múltiplas conexões em dev
- Migrações versionadas em `prisma/migrations/`

### 4. Autenticação — NextAuth.js

- Estratégia: **JWT** (stateless)
- Provider: **Credentials** (email + senha com hash bcrypt)
- O campo `role` do usuário é injetado no token JWT e disponível na sessão
- Modelos de suporte: `Conta`, `Sessao`, `TokenVerificacao`

### 5. Auditoria — `lib/logging.ts`

Toda operação significativa gera um registro na tabela `Log`:
- Ações de usuário (login, criação, edição, exclusão, baixa de estoque)
- Erros de sistema
- Tentativas de acesso não autorizado

---

## Fluxo de uma Requisição Autenticada

```
1. Usuário aciona ação na UI (ex: baixa de estoque)
       │
       ▼
2. React Hook Form valida dados no cliente (Zod)
       │
       ▼
3. TanStack Query dispara fetch para POST /api/estoque/baixar
       │
       ▼
4. API Route verifica sessão (getServerSession)
       │ ✗ → 401 Não autenticado
       │ ✓ ↓
5. Verifica Role do usuário (ADMIN | GERENTE | OPERADOR)
       │ ✗ → 403 Acesso negado + Log
       │ ✓ ↓
6. Valida payload com Zod
       │ ✗ → 400 Dados inválidos
       │ ✓ ↓
7. Inicia transação Prisma:
       ├─ Busca produto
       ├─ Verifica estoque disponível
       ├─ Atualiza quantidade
       ├─ Cria MovimentacaoEstoque
       └─ Cria Log da operação
       │
       ▼
8. Retorna 200 + produto atualizado
       │
       ▼
9. TanStack Query invalida cache e re-renderiza UI
```

---

## Decisões de Design

| Decisão | Justificativa |
|---|---|
| Pages Router em vez de App Router | Compatibilidade com NextAuth v4 e menor complexidade inicial |
| JWT em vez de Database Sessions | Menor overhead de banco em operações de leitura de sessão |
| Prisma Transactions em operações críticas | Garantia de atomicidade em movimentações de estoque |
| Zod em client e server | Validação consistente e type-safe em ambas as camadas |
| bcrypt com 10 salt rounds | Equilíbrio entre segurança e performance |
| Log em toda operação relevante | Rastreabilidade completa para auditoria e debugging |

---

## Segurança

- **Senhas**: nunca armazenadas em texto puro; sempre com hash bcrypt (10 rounds)
- **Autorização**: verificada server-side em cada endpoint (não confia no cliente)
- **Validação**: toda entrada do usuário é validada com Zod antes de chegar ao banco
- **Sessão**: token JWT assinado com `NEXTAUTH_SECRET`
- **SQL Injection**: mitigado pelo uso do Prisma ORM (queries parametrizadas)
