## Why

O PRD (seção 3, "Cadastro e organização") exige organizar o armazém em **áreas, corredores e posições** para facilitar a localização. Essa estrutura física é **pré-requisito de toda movimentação de estoque**: o `StockItem` (saldo) é gravado por `Position`, e os Fluxos 1 (recebimento, "qual posição guardar"), 2 (expedição, "onde está o produto") e 4 (inventário, "produtos ou áreas a conferir") dependem de posições já cadastradas. Hoje a rota `/localizacao` é apenas um placeholder e não há como cadastrar a hierarquia.

## What Changes

- Implementar o **CRUD da hierarquia `Área → Corredor → Posição`** na rota `/localizacao`: listar, cadastrar, editar e remover cada nível.
- **Área**: `code` (único) + `name`. **Corredor**: `code` (único dentro da área) + `areaId`. **Posição**: `code` (único dentro do corredor) + `aisleId`.
- Visualização da hierarquia (áreas com seus corredores e a contagem de posições), com seleção de área/corredor para o cadastro encadeado.
- **Guarda de remoção**: impedir remover Área com corredores, Corredor com posições, e Posição com `StockItem`/`Movement`/`InventoryItem` vinculados — retornando erro claro em vez de quebrar a integridade.
- Novo módulo `src/modules/locations` (`schema.ts`, `queries.ts`, `actions.ts`, `components/`), seguindo o padrão de Produtos/Fornecedores (Zod + Server Actions + shadcn).
- Substituir o placeholder de `src/app/localizacao/page.tsx` por um Server Component.

Não inclui (changes futuras): movimentação de estoque, alocação de produtos em posições, alertas e inventário. Aqui só se constrói a **estrutura física** onde o estoque será gravado depois.

## Capabilities

### New Capabilities
- `locations`: cadastro, listagem, edição e remoção da hierarquia física do armazém (Área → Corredor → Posição), com unicidade de código por nível e remoção protegida contra vínculos existentes.

### Modified Capabilities
<!-- Nenhuma — products/categories/suppliers não mudam de comportamento. -->

## Impact

- **Código**: novo módulo `src/modules/locations`; substitui o placeholder de `src/app/localizacao/page.tsx`; reusa componentes shadcn já instalados (`table`, `dialog`, `select`, `input`, `button`).
- **Dados**: usa os modelos `Area`, `Aisle`, `Position` já existentes no schema Prisma (sem mudança de schema, sem migration nova).
- **UI**: árvore/listagem da hierarquia e formulários de cada nível, com cadastro encadeado (área → corredor → posição).
- **Habilita**: a futura change de movimentação de estoque, que grava `StockItem` por `Position`.
