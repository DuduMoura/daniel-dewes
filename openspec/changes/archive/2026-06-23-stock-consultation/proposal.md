## Why

O PRD (Fluxo 5 — Consulta de Estoque + seção 3, "Localização e busca") exige que, ao consultar um produto, o sistema exiba **o saldo atual, a posição onde está guardado, o nível mínimo e o histórico recente de movimentações**. Hoje a área de Produtos lista os produtos com saldo **total** e permite busca por nome/categoria, mas **não mostra em quais posições o produto está guardado** nem o **histórico de movimentações do produto** — os dois pontos centrais do Fluxo 5. A query `getProduct` (com `stockItems.position`) já existe, mas não é usada por nenhuma tela. Esta é a última lacuna funcional do PRD.

## What Changes

- Criar a **tela de consulta/detalhe de um produto** em `/produtos/[id]`, exibindo:
  - cabeçalho com nome, SKU, categoria, **estoque mínimo** e **saldo total atual** (com destaque quando abaixo do mínimo);
  - **distribuição por posição**: cada posição (Área/Corredor/Posição) onde o produto tem saldo, com a quantidade — atende "indicar em qual posição o produto está guardado";
  - **histórico recente de movimentações** do produto (entradas, saídas, devoluções, transferências), reusando a tabela de movimentações já existente;
  - os fornecedores do produto (para reposição).
- Tornar a tela acessível: o nome do produto na listagem de `/produtos` vira **link** para o detalhe.
- Adicionar `listMovementsByProduct(productId)` em movimentações e enriquecer `getProduct` com o rótulo hierárquico das posições.

Não inclui (fora de escopo): edição na tela de consulta (continua nos diálogos da listagem); novos dados de domínio.

## Capabilities

### New Capabilities
- `stock-consultation`: consulta de um produto exibindo saldo atual, distribuição por posição, estoque mínimo e histórico recente de movimentações.

### Modified Capabilities
<!-- Nenhuma mudança de comportamento especificado; products/movements ganham apenas leituras/links adicionais. -->

## Impact

- **Código**: nova rota `src/app/produtos/[id]/page.tsx`; novo módulo/leituras em `src/modules/products` (consulta) e `listMovementsByProduct` em `src/modules/movements/queries.ts`; link na tabela de produtos. Reusa `MovementsTable` e componentes shadcn.
- **Dados**: usa modelos já existentes (`Product`, `StockItem`, `Position`, `Movement`); sem mudança de schema, sem migration.
- **UI**: página de detalhe do produto com saldo por posição e histórico.
- **Completa** o Fluxo 5 do PRD.
