## Context

Auth implementado (change `auth-rbac`): `getSession()` disponível em Server Components e Actions; sidebar recebe `user` como prop. `Alert` model tem `createdAt`. `User` não tem campo de última visita a alertas.

## Goals / Non-Goals

**Goals:**
- Badge de contagem de alertas novos na sidebar para GESTOR e COMPRAS.
- Rastrear "visto" por usuário via `alertsLastSeenAt`.
- Toast no login para COMPRAS quando há alertas pendentes.

**Non-Goals:** email, push, SSE/WebSocket, centro de notificações separado.

## Decisions

### `alertsLastSeenAt` no model `User`
Campo `DateTime?` atualizado quando o usuário acessa `/alertas`. "Novo" = alerta ABERTO com `createdAt > alertsLastSeenAt` (ou todos se null). **Por quê:** estado mínimo, sem tabela extra; idempotente (cada visita marca como "visto").

### Badge só para GESTOR e COMPRAS
OPERADOR não vê alertas (RBAC). Badge exibido apenas quando `unreadCount > 0`. **Por quê:** apenas quem age sobre alertas precisa do sinal.

### Toast via `loginAction` + Client Component
`loginAction` retorna `{ unreadAlerts: number }` para COMPRAS. `LoginForm` mostra toast se `> 0`. **Por quê:** toast é client-side; a action tem o contexto de role e pode fazer a query em uma única roundtrip.

### `markAlertsSeen` como Server Action
Atualiza `User.alertsLastSeenAt = now()`. Chamado no `useEffect` do componente de listagem de alertas. **Por quê:** efeito de leitura — não muda dados de estoque; fora de transação.
