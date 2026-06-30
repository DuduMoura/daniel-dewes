## Why

O sistema WMS está completamente aberto: qualquer pessoa com acesso à URL pode ver, criar, editar e deletar qualquer dado — sem identidade, sem controle de permissões. O PRD define três perfis com responsabilidades distintas (Gestor, Operador, Compras), e o schema já tem `User` + enum `Role`, mas auth foi adiado "dependendo de hospedagem". A decisão de hospedagem está resolvida: PostgreSQL via Docker/Vercel com Prisma. Esta change fecha o gap.

## What Changes

- **Autenticação via credenciais** (email + senha com bcrypt): login, logout, sessão JWT em cookie httpOnly.
- **Middleware de rota**: todas as páginas exigem sessão válida; `/login` é a única rota pública.
- **RBAC por perfil** nas Server Actions (rejeita na camada de dados) e na sidebar (oculta itens sem permissão):
  - `GESTOR`: acesso total, incluindo gestão de usuários.
  - `OPERADOR`: dashboard, movimentações, pedidos, inventário, produtos e localização (leitura/operação).
  - `COMPRAS`: dashboard, alertas, fornecedores e produtos (leitura).
- **Gestão de usuários** (`/usuarios`, só GESTOR): listar, criar, editar nome/role e deletar.
- **Seed de bootstrap**: script para criar o primeiro usuário GESTOR via variável de ambiente.
- Atualização do `AGENTS.md`: registra auth como implementado e documenta as regras de RBAC.

Não inclui: OAuth/SSO, recuperação de senha por email, rate-limiting de login (ficam para evolução).

## Capabilities

### New Capabilities
- `auth`: login com credenciais, sessão JWT em cookie, logout.
- `rbac`: restrição de rotas e ações por perfil (`GESTOR` / `OPERADOR` / `COMPRAS`).
- `users`: gestão de usuários pelo Gestor (CRUD).

### Modified Capabilities
- `app-shell`: sidebar exibe nome/role do usuário logado, botão de logout e itens filtrados por perfil.

## Impact

- **Schema**: adiciona `passwordHash String` ao modelo `User` (migration necessária).
- **Novas deps**: `jose` (JWT), `bcryptjs` (hash de senha).
- **Código**: `src/lib/session.ts`, `src/lib/require-role.ts`, `middleware.ts`, módulo `auth`, módulo `users`, `src/app/login/page.tsx`, `src/app/usuarios/page.tsx`.
- **Modificado**: `src/app/layout.tsx`, `src/components/app-sidebar.tsx`, todas as Server Actions (checagem de role).
- **AGENTS.md**: decisão de auth atualizada.
