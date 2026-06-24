## Why

O PRD (seção 3, "Controle e acompanhamento" + Fluxo 3) exige que o sistema **alerte o responsável por compras quando o estoque de um item cai abaixo do mínimo definido**. Com a movimentação de estoque já funcionando, o saldo agora se move e pode cruzar o limite — mas nada observa isso: a rota `/alertas` é um placeholder, o modelo `Alert` nunca é populado, e o card "Alertas em aberto" do dashboard mostra sempre zero. Esta change fecha o Fluxo 3.

## What Changes

- Implementar a **geração e resolução automática de alertas de estoque mínimo**, comparando o **saldo total de cada produto** (soma de `StockItem` em todas as posições) com o seu `minStock`:
  - saldo **< mínimo** e sem alerta aberto → **cria** um `Alert` (status ABERTO, snapshot de quantidade atual e mínima);
  - saldo **< mínimo** com alerta já aberto → **atualiza** a quantidade atual do alerta;
  - saldo **≥ mínimo** com alerta aberto → **resolve** o alerta (status RESOLVIDO, `resolvedAt`).
- **Reconciliação (`syncAlerts`)** disparada (a) **após cada movimentação** (o saldo só muda ali) e (b) ao **abrir a página de alertas**, mantendo o estado coerente sem job em background.
- Tela `/alertas` listando os alertas **em aberto** com produto, quantidade atual, mínimo e o **fornecedor** correspondente (PRD: "iniciar um novo pedido de compra com o fornecedor correspondente").
- Novo módulo `src/modules/alerts` (`service.ts` com `syncAlerts`, `queries.ts`, `components/`). Substituir o placeholder de `src/app/alertas/page.tsx`.

Não inclui (changes futuras): inventário, notificações por email/push (o "aviso" é a tela + o contador do dashboard), autenticação.

## Capabilities

### New Capabilities
- `alerts`: geração e resolução automática de alertas quando o saldo total de um produto fica abaixo (ou volta acima) do estoque mínimo, e a listagem dos alertas em aberto.

### Modified Capabilities
<!-- Nenhuma mudança de comportamento especificado; a movimentação passa a disparar a reconciliação como efeito (código), sem alterar a spec de movements. -->

## Impact

- **Código**: novo módulo `src/modules/alerts`; substitui o placeholder de `/alertas`; adiciona uma chamada a `syncAlerts(productId)` em `src/modules/movements/actions.ts` após cada movimentação bem-sucedida.
- **Dados**: usa o modelo `Alert` já existente (sem mudança de schema, sem migration). Passa a criar/atualizar/resolver registros de `Alert`.
- **UI**: lista de alertas em aberto; o card "Alertas em aberto" do dashboard passa a refletir dados reais.
- **Habilita**: visão de reposição para o perfil de Compras.
