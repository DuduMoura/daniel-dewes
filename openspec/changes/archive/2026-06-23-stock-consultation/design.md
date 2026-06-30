## Context

A listagem de produtos (`/produtos`) já existe com busca por nome e filtro por categoria, mostrando o saldo total. As movimentações já gravam `Movement` com posições de origem/destino, e existe `MovementsTable` para renderizar um histórico. A query `getProduct` já inclui `category`, `suppliers` e `stockItems.position`, mas não é consumida por nenhuma tela e a posição não traz o rótulo hierárquico (corredor/área). Convenções valem conforme o `AGENTS.md`.

## Goals / Non-Goals

**Goals:**
- Tela de consulta de um produto com saldo atual, distribuição por posição, mínimo e histórico recente de movimentações.
- Reusar o que já existe (tabela de movimentações, padrão de leitura em Server Component).

**Non-Goals:**
- Editar o produto na tela de consulta (segue nos diálogos da listagem).
- Filtro/paginação avançada do histórico; gráficos.
- Mudança de schema.

## Decisions

### Rota de detalhe `/produtos/[id]` (Server Component)
Criar `src/app/produtos/[id]/page.tsx` como Server Component que carrega os dados do produto e renderiza a consulta. **Por quê:** leitura em Server Component é o padrão da casa; o detalhe é puramente de leitura. O `id` vem do segmento dinâmico (Next 16: `params` é `Promise`).

### Enriquecer `getProduct` com rótulo de posição
Ajustar `getProduct` para incluir `stockItems.position.aisle.area` (e ordenar), de modo que cada saldo por posição mostre "ÁREA / CORREDOR / POSIÇÃO". **Por quê:** o Fluxo 5 pede "a posição onde está guardado"; o rótulo hierárquico é o endereço legível. Reusa a query já existente em vez de criar outra.

### Distribuição por posição = `stockItems` com saldo
Exibir as posições onde o produto tem `quantity > 0`, com a quantidade; o saldo total é a soma. Se não houver nenhuma, mostrar "sem estoque em nenhuma posição". **Por quê:** "onde está guardado" só faz sentido para posições com saldo; zera o ruído de posições vazias.

### `listMovementsByProduct(productId, limit)` reusando a forma de `listMovements`
Nova leitura em `movements/queries.ts` com o **mesmo `include`** de `listMovements` (produto, posições com área/corredor, fornecedor), filtrada por `productId` e ordenada por data desc. **Por quê:** permite reusar `MovementsTable` sem adaptação, garantindo consistência visual com a tela de Movimentações.

### Acesso pelo nome na listagem
O nome do produto na `products-table` vira um `Link` para `/produtos/[id]`. **Por quê:** é o caminho natural de "buscar o produto e consultar"; mantém a busca por nome/categoria já existente como porta de entrada (Fluxo 5, passo 1).

### Saldo destacado vs. mínimo
No cabeçalho, o saldo total fica em destaque (vermelho) quando `< minStock`, espelhando a convenção já usada na tabela de produtos. **Por quê:** consistência e leitura imediata da situação de reposição.

## Risks / Trade-offs

- **Link a partir da tabela** → pequena alteração na `products-table` (envolver o nome num `Link`); risco baixo, sem mudar comportamento de edição/remoção (botões de ação seguem iguais).
- **Histórico longo** → limitar a N movimentações recentes (ex.: 20) evita carregar tudo; "ver mais" fica para evolução futura.
- **Produto inexistente** → `getProduct` retorna `null`; a rota deve responder com `notFound()`.
