## Why

O PRD (Fluxo 3) exige que "o responsável por compras **receba a notificação**" quando um produto cai abaixo do estoque mínimo. Os alertas já são gerados e exibidos em `/alertas`, mas o usuário COMPRAS não tem nenhum sinal visual proativo de que há alertas novos — precisa navegar manualmente até a tela. Com autenticação implementada (change `auth-rbac`), agora é possível saber quem está logado e personalizar a experiência por perfil.

## What Changes

- **Badge de notificação** no item "Alertas" da sidebar: exibe a contagem de alertas ABERTOS gerados **após** o último acesso do usuário à tela de alertas.
- **Rastreamento de "última visita"**: campo `alertsLastSeenAt DateTime?` no model `User`; atualizado toda vez que o usuário acessa `/alertas`.
- **Destaque por perfil**: o badge é exibido para GESTOR e COMPRAS (os perfis que precisam agir); OPERADOR não vê alertas na sidebar.
- **Toast de boas-vindas**: ao logar, se houver alertas novos, COMPRAS recebe um toast com a contagem e link para `/alertas`.

Não inclui: notificação por email/push, agendamento (cron), centro de notificações separado.

## Capabilities

### Modified Capabilities
- `alerts`: adiciona rastreamento de leitura por usuário e badge na sidebar.
- `app-shell`: sidebar exibe badge de notificação no item "Alertas" para GESTOR e COMPRAS.
- `auth`: login exibe toast de notificação para COMPRAS se houver alertas novos.

## Impact

- **Schema**: adiciona `alertsLastSeenAt DateTime?` ao model `User` (migration).
- **Código**: `src/modules/alerts/actions.ts` (nova action `markAlertsSeen`); `src/app/alertas/page.tsx` (chama `markAlertsSeen`); `src/app/layout.tsx` (busca contagem de alertas novos); `src/components/app-sidebar.tsx` (exibe badge).
- **Auth**: `loginAction` retorna contagem de alertas novos para COMPRAS (toast no client).
