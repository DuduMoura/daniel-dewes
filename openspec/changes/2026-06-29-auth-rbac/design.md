## Context

Stack: Next.js 16 App Router, Prisma 7, Zod 4, TypeScript. Sem next-auth (não instalado). Schema tem `User` com `Role` enum (GESTOR/OPERADOR/COMPRAS) mas sem campo de senha. Convenções do `AGENTS.md` valem: Zod como fonte única de tipos, escrita em Server Actions, leitura em Server Components.

## Goals / Non-Goals

**Goals:**
- Autenticar usuários com email + senha (bcrypt); emitir JWT em cookie httpOnly.
- Proteger todas as rotas via middleware; redirecionar para `/login` sem sessão.
- Restringir Server Actions por role (GESTOR/OPERADOR/COMPRAS).
- Exibir navegação filtrada por perfil na sidebar.
- Permitir que GESTOR gerencie usuários (CRUD).

**Non-Goals:** OAuth, recuperação de senha, rate-limiting, auditoria de logins.

## Decisions

### JWT em cookie httpOnly via `jose` (sem next-auth)
Sessão armazenada como JWT assinado com HMAC-SHA256 (`jose`) em cookie `wms_session` (httpOnly, SameSite=Lax, Secure em produção). Payload: `{ id, name, email, role }`. TTL: 7 dias. **Por quê:** dependência zero de auth framework; portável para qualquer hosting com PostgreSQL; compatível com qualquer versão do Next.js; código transparente e auditável. O campo `SESSION_SECRET` (variável de ambiente) assina o JWT.

### `getSession()` como ponto único de leitura da sessão
`src/lib/session.ts` exporta `getSession()` (Server Component / Server Action), `createSession()` e `deleteSession()`. Consumido por layout, actions e middleware. **Por quê:** centraliza a leitura do cookie/JWT; evitar que cada módulo acesse o cookie diretamente.

### Middleware leve (só verifica existência e validade do JWT)
`middleware.ts` verifica `wms_session` com `jwtVerify`; redireciona para `/login` se ausente/inválido. **Não** checa role (isso fica nas actions/pages). **Por quê:** middleware roda em Edge Runtime — manter simples e rápido; RBAC granular fica no servidor.

### `requireRole()` nas Server Actions
`src/lib/require-role.ts` exporta `requireSession()` e `requireRole(...roles)`. Chamado no início de toda action que muta dados. Lança erro (capturado pelo boundary do Next.js) se sessão ausente ou role insuficiente. **Por quê:** garante que o RBAC está na camada de dados (não só na UI); consistente com a regra de ouro nº 1 (Zod + validação server-side).

### Sidebar filtrada por role (prop `user`)
`AppSidebar` recebe `user: SessionUser | null` como prop do layout (Server Component). Cada `NavItem` tem `roles?: Role[]`; se omitido, item é visível para todos. **Por quê:** a sidebar é `"use client"` — não pode chamar `getSession()` diretamente; receber prop do layout (servidor) é o padrão correto.

### Regras de RBAC por área

| Área | GESTOR | OPERADOR | COMPRAS |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Movimentações | ✅ | ✅ | ❌ |
| Pedidos | ✅ | ✅ | ❌ |
| Inventário | ✅ | ✅ | ❌ |
| Alertas | ✅ | ❌ | ✅ |
| Produtos (leitura) | ✅ | ✅ | ✅ |
| Produtos (CRUD) | ✅ | ❌ | ❌ |
| Fornecedores (leitura) | ✅ | ❌ | ✅ |
| Fornecedores (CRUD) | ✅ | ❌ | ❌ |
| Localização | ✅ | ✅ | ❌ |
| Usuários | ✅ | ❌ | ❌ |

### Senha com bcrypt (bcryptjs, 12 rounds)
`bcryptjs` (pure JS, sem compilação nativa). 12 salt rounds: ~250ms em hardware moderno — seguro e aceitável para login. Campo `passwordHash String` adicionado ao model `User` (migration necessária).

### Seed de bootstrap via `npm run db:seed`
Script `prisma/seed.ts` lê `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` do ambiente e cria o primeiro usuário GESTOR se não existir. **Por quê:** sem bootstrap não há como logar no sistema após o deploy inicial.

### Gestão de usuários (`/usuarios`, só GESTOR)
Módulo `src/modules/users/` com actions: `createUser` (com senha), `updateUser` (nome/role, sem mudar senha), `resetPassword`, `deleteUser`. Página `/usuarios` protegida a GESTOR via `requireRole("GESTOR")` na action e redirect no Server Component.

## Risks / Trade-offs

- **`SESSION_SECRET` em variável de ambiente obrigatória em produção**: se ausente, usa fallback `"dev-secret-change-in-production"` (inseguro). Documentado em `.env.example`.
- **Migration com coluna obrigatória em tabela existente**: `passwordHash String` pode falhar se já houver usuários sem hash. Tratado com `@default("")` temporário na migration + instrução de seed imediato.
- **Sem "lembrar sessão"**: TTL fixo de 7 dias; não há refresh automático de token. Após expiração, usuário precisa logar novamente.
- **Sidebar server → client**: passar `user` como prop adiciona um campo extra ao HTML inicial; payload mínimo (id, name, role) — aceitável.
