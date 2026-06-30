## Context

A fundação (`wms-foundation`) já entregou o app shell, o modelo de dados Prisma (incluindo `Product` e `Category`) e o módulo de exemplo `src/modules/products` com `schema.ts`, `queries.ts` e `actions.ts`. Esta change torna a área de Produtos funcional, sendo a primeira feature de domínio. As convenções valem conforme o `AGENTS.md` (Zod fonte única, leitura em Server Components, escrita em Server Actions, banco via singleton `db`).

## Goals / Non-Goals

**Goals:**
- CRUD de produtos completo na rota `/produtos` (listar, criar, editar, remover).
- Gestão de categorias (criar/listar) para classificar produtos.
- Busca por nome e filtro por categoria.
- Exibir saldo total atual (somente leitura) por produto.

**Non-Goals:**
- Movimentação de estoque (entrada/saída/devolução/transferência) — change futura.
- Localização, alertas e inventário.
- Autenticação/RBAC.
- Vínculo produto↔fornecedor (fica para a change de fornecedores).

## Decisions

### Reuso do módulo `products` e novo módulo `categories`
Completar `src/modules/products` (já tem `schema.ts` com `productSchema`/`updateProductSchema`, `queries.ts` e `actions.ts`) e criar `src/modules/categories` com o mesmo padrão. **Por quê:** mantém a organização por feature definida na fundação; o schema Zod do produto já existe e é reutilizado no formulário e na action.

### Leitura/escrita seguindo o padrão da casa
A página `/produtos` é Server Component que chama `listProducts()`/`listCategories()`. Criação/edição/remoção via Server Actions (`createProduct`, `updateProduct`, `deleteProduct`, `createCategory`) com `revalidatePath("/produtos")`. **Por quê:** consistência com `AGENTS.md`; dados sempre refletem o estado atual.

### Saldo total via agregação
O saldo total exibido reutiliza a soma de `StockItem.quantity` (já há `getProductBalance`); na listagem, usar uma agregação por produto para evitar N+1. **Por quê:** saldo é derivado das posições (fonte única), não um campo redundante em `Product`.

### Busca/filtro
Busca por nome (case-insensitive, `contains`) e filtro por `categoryId`, recebidos via `searchParams` da página (Next 16: `searchParams` é `Promise`). **Por quê:** filtro de carga de dados pertence ao server (decisão alinhada ao doc do Next "What to use and when"); mantém a lista paginável/filtrável sem estado client.

### UI: tabela + formulário em diálogo
Listagem com `Table` (shadcn); criação/edição em um formulário (provavelmente em `Dialog`) usando `react-hook-form` + `zodResolver` com o `productSchema`. Seleção de categoria via `Select`. Feedback com `sonner` (toast). **Por quê:** padrão operacional consistente; componentes shadcn adicionais (`dialog`, `select`, `form`) serão adicionados conforme necessidade.

### Validação de unicidade (SKU/categoria)
A unicidade de `Product.sku` e `Category.name` é garantida pela constraint `@unique` do Prisma; as actions capturam o erro de violação (P2002) e retornam mensagem amigável de "já está em uso". **Por quê:** evita race condition de checagem prévia e mantém o banco como autoridade.

## Risks / Trade-offs

- **N+1 ao calcular saldo por produto na lista** → usar `groupBy`/agregação única em `StockItem` por `productId`, não uma query por produto.
- **Tratamento do erro P2002 do Prisma** → encapsular nas actions e mapear para `errors` no `ActionResult`; testar o caminho de SKU/categoria duplicada.
- **Componentes shadcn adicionais** (`dialog`/`select`/`form`) podem introduzir dependências → adicionar apenas os necessários.
- **Remoção de produto com histórico futuro** → nesta change não há movimentações; quando existirem, a remoção precisará de regra (bloquear ou soft-delete). Fora do escopo agora, mas anotado.

## Open Questions

- Remoção deve ser exclusão física (atual) ou soft-delete? Mantido físico nesta change; revisar quando houver movimentações associadas.
- Gestão de categorias terá tela própria ou apenas criação inline no formulário de produto? Decidir na implementação conforme simplicidade (preferência: criação inline + listagem na própria área de produtos).
