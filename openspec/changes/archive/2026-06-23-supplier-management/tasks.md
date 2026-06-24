## 1. Módulo de fornecedores (dados)

- [x] 1.1 Criar `src/modules/suppliers/schema.ts` (Zod: nome obrigatório; email opcional com formato; phone/contact opcionais; productIds: string[])
- [x] 1.2 Criar `src/modules/suppliers/queries.ts` (`listSuppliers` com busca por nome e `_count` de produtos; `getSupplier` com produtos associados)
- [x] 1.3 Criar `src/modules/suppliers/actions.ts` (`createSupplier`, `updateSupplier`, `deleteSupplier`) tratando a relação N:N (connect/set) e revalidando `/fornecedores`

## 2. UI da área de Fornecedores

- [x] 2.1 Adicionar componente shadcn `checkbox` se necessário para a seleção de produtos
- [x] 2.2 Criar a tabela de fornecedores (nome, email, telefone, qtd. de produtos fornecidos)
- [x] 2.3 Criar o formulário de fornecedor (react-hook-form + zodResolver) para criar e editar, com seleção múltipla de produtos fornecidos
- [x] 2.4 Adicionar ação de remoção com confirmação
- [x] 2.5 Adicionar busca por nome (via `searchParams`)
- [x] 2.6 Exibir feedback de sucesso/erro com `sonner`

## 3. Página e integração

- [x] 3.1 Substituir o placeholder de `src/app/fornecedores/page.tsx` por Server Component que consome `listSuppliers`/`listProducts` e os `searchParams`
- [x] 3.2 Tratar estados de lista vazia e de busca sem resultados

## 4. Validação

- [x] 4.1 Rodar typecheck (`tsc --noEmit`) e build (`next build`) sem erros
- [x] 4.2 Validar os fluxos: criar, listar, editar, remover, buscar e associar/desassociar produtos
