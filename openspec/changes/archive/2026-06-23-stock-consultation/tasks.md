## 1. Leituras (dados)

- [x] 1.1 Enriquecer `getProduct` em `src/modules/products/queries.ts` para incluir `stockItems.position.aisle.area` (rótulo hierárquico) e ordenar por posição
- [x] 1.2 Adicionar `listMovementsByProduct(productId, limit)` em `src/modules/movements/queries.ts` com o mesmo `include` de `listMovements`, filtrado por produto e ordenado por data desc

## 2. UI da consulta

- [x] 2.1 Criar a rota `src/app/produtos/[id]/page.tsx` (Server Component) que carrega o produto e suas movimentações; `notFound()` quando não existir
- [x] 2.2 Cabeçalho do produto (nome, SKU, categoria, estoque mínimo, saldo total com destaque quando < mínimo) e fornecedores
- [x] 2.3 Seção de distribuição por posição (endereço + quantidade) com estado "sem estoque em nenhuma posição"
- [x] 2.4 Seção de histórico reusando `MovementsTable`, com estado "sem movimentações"
- [x] 2.5 Tornar o nome do produto na `products-table` um link para `/produtos/[id]`

## 3. Validação

- [x] 3.1 Rodar typecheck (`tsc --noEmit`) e build (`next build`) sem erros
- [x] 3.2 Validar no banco: consulta retorna saldo por posição correto, saldo total, e histórico do produto; produto inexistente resulta em "não encontrado"
