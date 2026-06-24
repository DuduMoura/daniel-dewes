## 1. Serviço de reconciliação (dados)

- [x] 1.1 Criar `src/modules/alerts/service.ts` com `syncAlerts(productId?)` (sem `'use server'`): calcula o saldo total por produto e cria/atualiza/resolve o `Alert` conforme a comparação com `minStock`; idempotente; no máximo 1 alerta ABERTO por produto
- [x] 1.2 Criar `src/modules/alerts/queries.ts` com `listOpenAlerts` (alertas ABERTOS com produto e seus fornecedores, ordenados por mais recente)

## 2. Integração com a movimentação

- [x] 2.1 Em `src/modules/movements/actions.ts`, após o sucesso da transação, chamar `syncAlerts(productId)` do produto movimentado (fora da transação) e revalidar `/alertas`

## 3. UI da área de Alertas

- [x] 3.1 Criar a lista de alertas (produto, quantidade atual, mínimo, fornecedores) com destaque visual de severidade
- [x] 3.2 Tratar o estado de "nenhum alerta em aberto"
- [x] 3.3 Substituir o placeholder de `src/app/alertas/page.tsx` por Server Component que roda `syncAlerts()` (sync completo) e consome `listOpenAlerts`

## 4. Validação

- [x] 4.1 Rodar typecheck (`tsc --noEmit`) e build (`next build`) sem erros
- [x] 4.2 Validar no banco: saída abaixo do mínimo gera alerta; segunda avaliação não duplica (idempotência); entrada acima do mínimo resolve; listagem traz o fornecedor correspondente
