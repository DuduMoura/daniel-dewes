# Capability: notifications (alert)

## Overview
Sinalização proativa de alertas de estoque mínimo para os perfis que precisam agir (GESTOR, COMPRAS).

## Behaviors

### Badge na sidebar
- Item "Alertas" exibe badge numérico vermelho quando há alertas ABERTOS não vistos pelo usuário
- "Não visto" = criado após `User.alertsLastSeenAt` (ou todos, se nunca visitou)
- Badge some após o usuário visitar `/alertas`
- Visível apenas para GESTOR e COMPRAS

### Marcação automática de leitura
- Ao carregar a lista de alertas em `/alertas`, chama `markAlertsSeen()` automaticamente
- `alertsLastSeenAt` é atualizado para `now()` no banco

### Toast de boas-vindas (COMPRAS)
- Ao fazer login com role COMPRAS: se há alertas não vistos, exibe toast
- Mensagem: "X alerta(s) de estoque aguardam sua atenção" com link para `/alertas`
- Não exibido para GESTOR (já tem visão completa no dashboard)

## States

### Badge
- **Sem alertas novos**: item "Alertas" sem badge
- **Com alertas novos**: badge vermelho com contagem (ex: "3")
- **OPERADOR**: item Alertas não aparece na sidebar (sem badge)
