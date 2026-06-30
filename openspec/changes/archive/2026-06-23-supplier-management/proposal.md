## Why

O PRD (seção 3) exige cadastrar fornecedores com informações de contato e os produtos que cada um fornece. Os fornecedores são pré-requisito para o recebimento de mercadoria (Fluxo 1) e para o alerta de reposição (Fluxo 3, que indica "o fornecedor correspondente"). A rota `/fornecedores` ainda é um placeholder.

## What Changes

- Implementar o **CRUD de fornecedores** na rota `/fornecedores`: listar, cadastrar, editar e remover fornecedores (campos: nome, email, telefone, contato).
- Permitir **associar os produtos fornecidos** a cada fornecedor, usando a relação N:N `Supplier`↔`Product` já existente no schema.
- Listagem em **tabela** com busca por nome; cadastro/edição via **formulário** validado (mesmo padrão da área de Produtos: react-hook-form + Zod + shadcn).
- Novo módulo `src/modules/suppliers` (`schema.ts`, `queries.ts`, `actions.ts`, `components/`).
- Exibir, na listagem, a quantidade de produtos fornecidos por fornecedor.

Não inclui (changes futuras): movimentação de estoque, localização, alertas e inventário.

## Capabilities

### New Capabilities
- `suppliers`: cadastro, listagem, edição e remoção de fornecedores (nome, email, telefone, contato), com busca por nome e associação dos produtos fornecidos (N:N com produtos).

### Modified Capabilities
<!-- Nenhuma — products/categories não mudam de comportamento. -->

## Impact

- **Código**: novo módulo `src/modules/suppliers`; substitui o placeholder de `src/app/fornecedores/page.tsx`; reusa componentes shadcn já instalados (`dialog`, `select`, `table`, etc.).
- **Dados**: usa os modelos `Supplier` e a relação `SupplierProducts` já existentes (sem mudança de schema Prisma esperada, sem migration nova).
- **UI**: tabela e formulário de fornecedor; seleção múltipla de produtos fornecidos.
