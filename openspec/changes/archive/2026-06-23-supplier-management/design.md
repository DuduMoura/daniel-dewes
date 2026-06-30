## Context

A área de Produtos já está funcional e o padrão de feature (`schema`/`queries`/`actions`/`components`) está consolidado em `src/modules/products`. Esta change replica o mesmo padrão para Fornecedores e adiciona o vínculo N:N com produtos. Os modelos `Supplier` e a relação `SupplierProducts` já existem no schema Prisma (criados na fundação). Convenções valem conforme o `AGENTS.md`.

## Goals / Non-Goals

**Goals:**
- CRUD de fornecedores na rota `/fornecedores` (listar, criar, editar, remover).
- Associação de produtos fornecidos (N:N) no cadastro/edição.
- Busca por nome.

**Non-Goals:**
- Movimentação de estoque, localização, alertas, inventário.
- Pedidos de compra / reposição (apenas o vínculo fornecedor↔produto).
- Autenticação/RBAC.

## Decisions

### Novo módulo `suppliers` espelhando `products`
Criar `src/modules/suppliers` com `schema.ts` (Zod), `queries.ts` (`listSuppliers`, `getSupplier`), `actions.ts` (`createSupplier`, `updateSupplier`, `deleteSupplier`) e `components/`. **Por quê:** consistência com o padrão já validado; reduz decisões novas. Reusa os componentes de UI (tabela, dialog, form via react-hook-form direto — `form` do shadcn segue indisponível na base radix).

### Schema Zod do fornecedor
`name` obrigatório; `email` opcional com validação de formato quando presente; `phone` e `contact` opcionais. `productIds: string[]` para os produtos fornecidos. **Por quê:** o email é o único campo com regra de formato; os demais são texto livre conforme o PRD ("informações de contato").

### Associação N:N via `set`
Na criação/edição, gravar a relação com `products: { set: productIds.map(id => ({ id })) }` (no update) e `connect` (no create). **Por quê:** `set` substitui o conjunto inteiro de associações pela seleção atual — casa exatamente com o comportamento do formulário (marcar/desmarcar). Evita lógica manual de diff.

### Leitura/escrita seguindo o padrão da casa
Página `/fornecedores` é Server Component que chama `listSuppliers(filters)` e `listProducts()` (para o seletor). Mutations via Server Actions com `revalidatePath("/fornecedores")`. Busca por nome via `searchParams` (Next 16: `Promise`). **Por quê:** consistência e dados sempre atuais.

### Contagem de produtos fornecidos
A listagem inclui `_count: { select: { products: true } }` do Prisma. **Por quê:** evita carregar todos os produtos só para contar; uma única query.

### UI de seleção de produtos
Seleção múltipla dos produtos fornecidos no formulário. Como não há componente multiselect no shadcn base, usar uma lista de checkboxes (ou o componente `checkbox` do shadcn, adicionado se necessário) dentro do diálogo, alimentada por `listProducts()`. **Por quê:** simples, acessível e suficiente para o volume esperado; evita dependência extra de combobox.

## Risks / Trade-offs

- **Lista de produtos grande no seletor** → para muitos produtos, checkboxes podem ficar longos; aceitável agora, com busca/scroll. Combobox com busca fica para evolução futura se necessário.
- **Remoção de fornecedor com vínculos** → a relação N:N é apenas associativa (tabela de junção), então remover o fornecedor remove só as associações, não os produtos. Sem risco de cascata indevida.
- **`set` em update** → exige enviar a lista completa de `productIds` selecionados; o formulário sempre envia o estado atual, então é seguro.

## Open Questions

- Exibir/editar a associação também pelo lado do Produto (quais fornecedores fornecem um produto)? Fora do escopo desta change; pode ser adicionado na área de Produtos depois.
