# Capability: notifications (alert)

## Overview
Badge numérico de alertas não lidos na sidebar e toast de boas-vindas para COMPRAS.

## Behaviors
- Badge no item "Alertas" da sidebar: contagem de alertas ABERTOS criados após `User.alertsLastSeenAt`
- Visível apenas para GESTOR e COMPRAS
- Visitar `/alertas` marca todos como vistos (`alertsLastSeenAt = now()`) via `markAlertsSeen()`
- Login com role COMPRAS: toast se houver alertas não lidos (link para `/alertas`)
