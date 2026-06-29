## 1. Schema

- [ ] 1.1 Adicionar `alertsLastSeenAt DateTime?` ao model `User` em `prisma/schema.prisma`
- [ ] 1.2 Gerar e aplicar migration

## 2. Action de marcação

- [ ] 2.1 Criar `src/modules/alerts/actions.ts` com `markAlertsSeen()`: atualiza `alertsLastSeenAt` do usuário logado

## 3. Badge na sidebar

- [ ] 3.1 Em `src/modules/alerts/queries.ts`: adicionar `countUnreadAlerts(userId, lastSeenAt)` — conta alertas ABERTOS criados após `lastSeenAt`
- [ ] 3.2 Em `src/app/layout.tsx`: buscar `unreadAlerts` para GESTOR/COMPRAS e passar para `<AppSidebar>`
- [ ] 3.3 Em `src/components/app-sidebar.tsx`: aceitar `unreadAlerts?: number`; exibir badge no item "Alertas" quando `> 0`

## 4. Marcação automática ao visitar /alertas

- [ ] 4.1 Em `src/modules/alerts/components/alerts-list.tsx`: chamar `markAlertsSeen()` via `useEffect` ao montar o componente

## 5. Toast no login para COMPRAS

- [ ] 5.1 Em `src/modules/auth/actions.ts`: `loginAction` retorna `{ ok: true, unreadAlerts?: number }` para role COMPRAS
- [ ] 5.2 Em `src/modules/auth/components/login-form.tsx`: após login bem-sucedido, se `unreadAlerts > 0`, exibe toast com contagem e link para `/alertas`

## 6. Validação

- [ ] 6.1 Login como COMPRAS com alertas abertos → toast aparece
- [ ] 6.2 Badge visível na sidebar com contagem correta
- [ ] 6.3 Após visitar `/alertas`, badge some
- [ ] 6.4 OPERADOR não vê badge nem item de Alertas
