## Why

A fundação do WMS está pronta (app shell + dashboard + modelo de dados), mas a rota `/produtos` ainda é um placeholder. O cadastro de produtos é o primeiro pré-requisito funcional de todo o sistema: sem produtos cadastrados não há o que movimentar, localizar, alertar ou inventariar. O PRD (seção 3) exige cadastrar produtos com nome, descrição, categoria e quantidade mínima em estoque.

## What Changes

- Implementar o **CRUD de produtos** na rota `/produtos`: listar, cadastrar, editar e remover produtos (campos: SKU, nome, descrição, categoria, estoque mínimo).
- Implementar **gestão de categorias**: criar e listar categorias para classificar produtos.
- Listagem em **tabela** (shadcn) com busca por nome/categoria; cadastro/edição via **formulário** validado.
- Reusar e completar o módulo `src/modules/products` já iniciado (schema Zod, queries, actions) e criar o módulo `src/modules/categories`.
- A página de produtos passa a exibir o saldo total atual de cada produto (somatório das posições) quando houver estoque — apenas leitura.

Não inclui (changes futuras): movimentação de estoque (entrada/saída/devolução/transferência), localização e alertas.

## Capabilities

### New Capabilities
- `products`: cadastro, listagem, edição e remoção de produtos, com validação dos campos e busca por nome/categoria; exibição do saldo total atual (somente leitura).
- `categories`: criação e listagem de categorias usadas para classificar produtos.

### Modified Capabilities
<!-- Nenhuma — app-shell não muda de comportamento. -->

## Impact

- **Código**: completa `src/modules/products` (queries/actions/components) e adiciona `src/modules/categories`; substitui o placeholder de `src/app/produtos/page.tsx`.
- **Dados**: usa os modelos `Product` e `Category` já existentes (nenhuma mudança de schema Prisma esperada).
- **UI**: novos componentes de tabela e formulário de produto; possível adição de componentes shadcn (ex.: `dialog`, `select`, `form`) se necessário.
- **Sem migration nova** prevista.
