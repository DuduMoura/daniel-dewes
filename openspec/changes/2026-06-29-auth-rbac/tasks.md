## 1. Schema e dependências

- [ ] 1.1 Adicionar `passwordHash String @default("")` ao model `User` em `prisma/schema.prisma`
- [ ] 1.2 Gerar e aplicar migration (`npm run db:migrate`)
- [ ] 1.3 Confirmar que `jose` e `bcryptjs` + `@types/bcryptjs` estão em `package.json`

## 2. Camada de sessão e middleware

- [ ] 2.1 Criar `src/lib/session.ts`: `SessionUser`, `createSession()`, `getSession()`, `deleteSession()` usando `jose`
- [ ] 2.2 Criar `src/lib/require-role.ts`: `requireSession()` e `requireRole(...roles)` — lança erro se role insuficiente
- [ ] 2.3 Criar `middleware.ts` na raiz: verifica `wms_session` com `jwtVerify`; redireciona para `/login` se ausente/inválido; exclui `/_next`, `/api`, `/favicon.ico`

## 3. Módulo de autenticação

- [ ] 3.1 Criar `src/modules/auth/schema.ts`: `loginSchema` (email + senha mínimo 1 char)
- [ ] 3.2 Criar `src/modules/auth/actions.ts`: `loginAction(input)` (valida, compara bcrypt, chama `createSession`); `logoutAction()` (chama `deleteSession`, redireciona)
- [ ] 3.3 Criar `src/modules/auth/components/login-form.tsx`: form com react-hook-form + zodResolver, campos email/senha, botão com estado de loading, feedback de erro
- [ ] 3.4 Criar `src/app/login/page.tsx`: Server Component que redireciona para `/` se já autenticado; renderiza `<LoginForm />`

## 4. App shell com identidade e navegação por role

- [ ] 4.1 Atualizar `src/components/app-sidebar.tsx`: aceitar prop `user: SessionUser | null`; filtrar `NavItem` por `roles`; adicionar seção no rodapé com nome/role do usuário e botão de logout (chama `logoutAction`)
- [ ] 4.2 Atualizar `src/app/layout.tsx`: chamar `getSession()`, passar `user` para `<AppSidebar>`; se `!user` e não é `/login`, deixar middleware lidar (não duplicar redirect)

## 5. Gestão de usuários

- [ ] 5.1 Criar `src/modules/users/schema.ts`: `createUserSchema`, `updateUserSchema`, `resetPasswordSchema`
- [ ] 5.2 Criar `src/modules/users/queries.ts`: `listUsers()` com id, name, email, role, createdAt
- [ ] 5.3 Criar `src/modules/users/actions.ts`: `createUser`, `updateUser`, `resetPassword`, `deleteUser` — todos com `requireRole("GESTOR")`
- [ ] 5.4 Criar `src/modules/users/components/users-table.tsx`, `user-form-dialog.tsx` (create/edit), `reset-password-dialog.tsx`
- [ ] 5.5 Criar `src/app/usuarios/page.tsx`: Server Component com `requireRole("GESTOR")` redirect; lista usuários

## 6. RBAC nas Server Actions existentes

- [ ] 6.1 `src/modules/products/actions.ts`: `createProduct`, `updateProduct`, `deleteProduct` → `requireRole("GESTOR")`
- [ ] 6.2 `src/modules/suppliers/actions.ts`: `createSupplier`, `updateSupplier`, `deleteSupplier` → `requireRole("GESTOR")`
- [ ] 6.3 `src/modules/locations/actions.ts`: todas as actions → `requireRole("GESTOR")`
- [ ] 6.4 `src/modules/movements/actions.ts`: `registerMovement` → `requireRole("GESTOR", "OPERADOR")`
- [ ] 6.5 `src/modules/orders/actions.ts`: todas as actions → `requireRole("GESTOR", "OPERADOR")`
- [ ] 6.6 `src/modules/inventory/actions.ts`: todas as actions → `requireRole("GESTOR", "OPERADOR")`
- [ ] 6.7 `src/modules/categories/actions.ts`: todas as actions → `requireRole("GESTOR")`

## 7. Seed de bootstrap

- [ ] 7.1 Criar `prisma/seed.ts`: lê `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`; cria usuário GESTOR se não existir
- [ ] 7.2 Adicionar `"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }` ao `package.json` e script `"db:seed"`
- [ ] 7.3 Adicionar `.env.example` com `SESSION_SECRET`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`

## 8. Atualizar AGENTS.md

- [ ] 8.1 Substituir a entrada "Auth/RBAC adiado" pelo resumo das decisões tomadas (JWT/jose, bcryptjs, roles, seed)

## 9. Validação

- [ ] 9.1 `tsc --noEmit` sem erros
- [ ] 9.2 Login com credenciais corretas redireciona para `/`; credenciais erradas mostra erro
- [ ] 9.3 Acessar qualquer rota sem sessão redireciona para `/login`
- [ ] 9.4 OPERADOR não consegue executar `createProduct` (erro na action)
- [ ] 9.5 COMPRAS não vê "Movimentações" na sidebar
