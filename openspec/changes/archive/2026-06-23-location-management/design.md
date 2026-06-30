## Context

As áreas de Produtos e Fornecedores já estão funcionais e o padrão de feature (`schema`/`queries`/`actions`/`components`) está consolidado em `src/modules`. Esta change replica esse padrão para a hierarquia física do armazém. Os modelos `Area`, `Aisle`, `Position` já existem no schema Prisma (criados na fundação), com unicidade definida: `Area.code` único global; `Aisle` único por `@@unique([areaId, code])`; `Position` único por `@@unique([aisleId, code])`. `Position` tem relações com `StockItem`, `Movement` (from/to) e `InventoryItem`. Convenções valem conforme o `AGENTS.md`.

## Goals / Non-Goals

**Goals:**
- CRUD dos três níveis (Área, Corredor, Posição) na rota `/localizacao`.
- Respeitar a unicidade de código em cada nível e dar mensagem de erro clara em violação.
- Remoção protegida: não permitir apagar um nó que tem filhos ou vínculos de estoque/movimentação/inventário.
- Visualização da hierarquia para orientar o cadastro encadeado.

**Non-Goals:**
- Movimentação de estoque, alocação de produtos, saldo, alertas, inventário (changes futuras).
- Mudança de schema Prisma / migration.
- Autenticação/RBAC.

## Decisions

### Novo módulo `locations` espelhando `products`/`suppliers`
Criar `src/modules/locations` com `schema.ts` (Zod), `queries.ts`, `actions.ts` e `components/`. **Por quê:** consistência com o padrão já validado; reduz decisões novas. Reusa os primitivos de UI (`table`, `dialog`, `select`, `input`, `button`) — sem `form` do shadcn (indisponível na base radix), usando `react-hook-form` direto como nas outras features.

### Um único módulo para os três níveis
Área, Corredor e Posição vivem no mesmo módulo `locations` (não três módulos), pois são uma única hierarquia coesa e sempre manipulada em conjunto na mesma tela. **Por quê:** evita fragmentação; o relacionamento pai→filho é o coração da feature.

### Schemas Zod por nível
`areaSchema` (`code`, `name`); `aisleSchema` (`code`, `areaId`); `positionSchema` (`code`, `aisleId`). `code` obrigatório (normalizado: trim + uppercase) e `name` obrigatório só na Área. **Por quê:** o código é o identificador operacional do endereço físico; uppercase evita duplicatas "a1"/"A1". O mesmo schema valida no formulário (client) e na Server Action (server).

### Unicidade tratada na action, traduzindo o erro do Prisma
A criação/edição captura a violação de unique do Prisma (`P2002`) e retorna `{ ok: false, errors: { code: [...] } }` para o campo `code`, em vez de estourar. **Por quê:** a unicidade já é garantida pelo banco (`@@unique`); a action apenas traduz para feedback de formulário, sem corrida de "checar antes de inserir".

### Remoção protegida (guarda de integridade)
Antes de deletar: Área só sai se não tiver `aisles`; Corredor só sai se não tiver `positions`; Posição só sai se não tiver `stockItems`, `movementsFrom/To` nem `inventoryItems`. Caso contrário, retorna `{ ok: false }` com mensagem explicando o vínculo. **Por quê:** o schema não declara `onDelete: Cascade`, então um delete com filhos falharia no banco; preferimos uma checagem explícita com mensagem clara a um erro cru. Protege o saldo de estoque de exclusões acidentais.

### Leitura/escrita seguindo o padrão da casa
Página `/localizacao` é Server Component que chama `listAreas()` (áreas → corredores → posições, com contagens). Mutations via Server Actions com `revalidatePath("/localizacao")`. **Por quê:** consistência e dados sempre atuais.

### Cadastro encadeado por seleção
Para criar um Corredor escolhe-se a Área pai; para criar uma Posição escolhe-se Área e Corredor pai. A UI exibe a hierarquia (áreas com corredores e contagem de posições) e os formulários recebem o pai por contexto/seleção. **Por quê:** reflete a estrutura real e evita IDs soltos no formulário.

## Risks / Trade-offs

- **Volume de posições grande** → um armazém pode ter centenas de posições; a árvore pode ficar longa. Aceitável agora (contagem agregada + expandir por área); busca/paginação fica para evolução se necessário.
- **Edição de `code` com vínculos** → renomear o código de uma posição com estoque é permitido (não quebra FKs, que usam `id`), mas pode confundir operadores. Aceitável; o `id` é a chave estável.
- **Checagem de remoção vs. corrida** → entre checar filhos e deletar, em teoria um filho poderia ser inserido; risco desprezível no contexto single-tenant atual, e o banco ainda barraria via FK.
