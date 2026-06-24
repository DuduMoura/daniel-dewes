## 1. Módulo de categorias

- [x] 1.1 Criar `src/modules/categories/schema.ts` (Zod: nome obrigatório)
- [x] 1.2 Criar `src/modules/categories/queries.ts` (`listCategories`)
- [x] 1.3 Criar `src/modules/categories/actions.ts` (`createCategory`, com tratamento de nome duplicado P2002)

## 2. Módulo de produtos (queries e actions)

- [x] 2.1 Estender `src/modules/products/queries.ts`: listagem com saldo total por produto (agregação única, sem N+1) e suporte a busca por nome e filtro por categoria
- [x] 2.2 Ajustar `src/modules/products/actions.ts`: tratar SKU duplicado (P2002) retornando erro amigável no `ActionResult`
- [x] 2.3 Validar o `productSchema` cobre os campos exigidos (sku, nome, descrição, categoria, estoque mínimo) e regras (obrigatórios, mínimo ≥ 0)

## 3. UI da área de Produtos

- [x] 3.1 Adicionar componentes shadcn necessários (`dialog`, `select`; `form` indisponível na base radix — formulários feitos com react-hook-form direto sobre `input`/`label`/`select`)
- [x] 3.2 Criar a tabela de produtos (`src/modules/products/components`) com SKU, nome, categoria, estoque mínimo e saldo total
- [x] 3.3 Criar o formulário de produto (react-hook-form + zodResolver + `productSchema`) para criar e editar, com seleção de categoria
- [x] 3.4 Adicionar ação de remoção com confirmação
- [x] 3.5 Adicionar busca por nome e filtro por categoria (via `searchParams` na página)
- [x] 3.6 Permitir criar categoria (inline ou listagem) na área de produtos
- [x] 3.7 Exibir feedback de sucesso/erro com `sonner`

## 4. Página e integração

- [x] 4.1 Substituir o placeholder de `src/app/produtos/page.tsx` por Server Component que consome `listProducts`/`listCategories` e os `searchParams`
- [x] 4.2 Tratar estados de lista vazia e de busca sem resultados

## 5. Validação

- [x] 5.1 Rodar typecheck (`tsc --noEmit`) e build (`next build`) sem erros
- [x] 5.2 Validar manualmente os fluxos: criar, listar, editar, remover, buscar/filtrar e SKU duplicado
