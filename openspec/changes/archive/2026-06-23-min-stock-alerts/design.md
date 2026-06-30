## Context

A movimentação de estoque já atualiza o saldo por posição (`StockItem`) de forma atômica. O modelo `Alert` existe (`productId`, `currentQty`, `minStock`, `status` ABERTO/RESOLVIDO, `createdAt`, `resolvedAt`) mas nunca é populado. O `Product` tem `minStock`. Não há infraestrutura de jobs em background — a aplicação é um monolito Next.js. Convenções valem conforme o `AGENTS.md`.

## Goals / Non-Goals

**Goals:**
- Detectar quando o saldo total de um produto cai abaixo do `minStock` e abrir um alerta.
- Resolver o alerta automaticamente quando o saldo volta a ≥ `minStock`.
- Listar os alertas em aberto com o fornecedor correspondente.

**Non-Goals:**
- Notificações por email/push; jobs agendados; inventário; autenticação.
- Alerta por posição (o mínimo é do produto, então o alerta é por **produto**, com saldo somado entre posições).

## Decisions

### Saldo total por produto vs. `minStock`
O alerta é por **produto**: compara a soma de `StockItem.quantity` em todas as posições com `Product.minStock`. **Por quê:** o `minStock` é definido no produto (não na posição); um produto pode estar espalhado por várias posições e o que importa para reposição é o total disponível.

### Reconciliação idempotente (`syncAlerts`)
Função `syncAlerts(productId?)` que, para o(s) produto(s) avaliado(s):
- saldo `< minStock` e **sem** alerta ABERTO → cria `Alert` (ABERTO, `currentQty = saldo`, `minStock`);
- saldo `< minStock` e **com** alerta ABERTO → atualiza `currentQty` do alerta;
- saldo `≥ minStock` e **com** alerta ABERTO → marca RESOLVIDO + `resolvedAt = now`.

É **idempotente**: rodar duas vezes seguidas não muda o resultado. Mantém no máximo **um** alerta ABERTO por produto. **Por quê:** estado derivado do saldo; idempotência evita duplicados e permite chamar de vários pontos sem medo.

### Onde `syncAlerts` é chamado (sem job em background)
1. **Após cada movimentação** — em `movements/actions.ts`, após o sucesso da transação, chama `syncAlerts(productId)` do produto movimentado. É o único ponto onde o saldo muda.
2. **Ao abrir `/alertas`** — sync completo (todos os produtos) antes de listar, como rede de segurança (ex.: `minStock` alterado na edição do produto).

**Por quê:** aproxima o "verifica continuamente" do PRD sem cron/worker. O `syncAlerts` fica num `service.ts` **sem** `'use server'`, para ser importado tanto pela action de movimentação quanto pelo Server Component da página.

### `syncAlerts` fora da transação da movimentação
A chamada acontece **após** a transação de movimentação confirmar, não dentro dela. **Por quê:** o alerta é um efeito derivado, não parte da atomicidade saldo+movimento (regra de ouro nº 2 cobre saldo+`Movement`); se a geração de alerta falhasse, não deve desfazer uma movimentação já válida. O sync na página corrige qualquer divergência.

### Listagem orientada à reposição
A página `/alertas` lista os alertas ABERTOS com produto, quantidade atual, mínimo e os **fornecedores** do produto (via relação N:N já existente), atendendo ao passo do Fluxo 3 de "iniciar pedido com o fornecedor correspondente". **Por quê:** o alerta sozinho não basta; o responsável precisa saber a quem comprar.

### Resolução automática, não manual
O alerta resolve sozinho quando o saldo se recupera; não há botão de "dispensar". **Por quê:** o estado reflete a realidade do estoque; dispensar manualmente um alerta cujo saldo ainda está baixo mascararia o problema.

## Risks / Trade-offs

- **Sync no carregamento da página** → um sync completo a cada visita custa uma agregação por produto; aceitável no volume esperado. Se crescer, dá para evitar o sync full e confiar só no hook da movimentação.
- **Edição de `minStock` não dispara sync imediato** → se o gestor aumentar o mínimo, o alerta só aparece no próximo movimento ou ao abrir `/alertas`. Mitigado pelo sync na página; aceitável.
- **Acoplamento alerts↔movements** → esta change adiciona uma chamada em `movements/actions.ts`. É um efeito de borda explícito e documentado; não altera a spec de `movements`.
- **Concorrência no `syncAlerts`** → duas movimentações simultâneas do mesmo produto poderiam, em tese, criar dois alertas; mitigado por buscar alerta ABERTO existente antes de criar. Janela mínima no contexto atual.
