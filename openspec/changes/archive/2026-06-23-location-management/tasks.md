## 1. Módulo de localização (dados)

- [x] 1.1 Criar `src/modules/locations/schema.ts` (Zod: `areaSchema` com `code`+`name`; `aisleSchema` com `code`+`areaId`; `positionSchema` com `code`+`aisleId`; `code` normalizado trim+uppercase; tipos via `z.infer`)
- [x] 1.2 Criar `src/modules/locations/queries.ts` (`listAreas` retornando áreas → corredores → posições com `_count` de posições por corredor)
- [x] 1.3 Criar `src/modules/locations/actions.ts` para Área (`createArea`/`updateArea`/`deleteArea`) tratando `P2002` (código duplicado) e bloqueando remoção com corredores; `revalidatePath("/localizacao")`
- [x] 1.4 Adicionar em `actions.ts` as ações de Corredor (`createAisle`/`updateAisle`/`deleteAisle`) com unicidade por área e bloqueio de remoção com posições
- [x] 1.5 Adicionar em `actions.ts` as ações de Posição (`createPosition`/`updatePosition`/`deletePosition`) com unicidade por corredor e bloqueio de remoção com `stockItems`/`movements`/`inventoryItems`

## 2. UI da área de Localização

- [x] 2.1 Criar a visualização da hierarquia (áreas → corredores → posições, com contagem de posições)
- [x] 2.2 Criar o formulário de Área (react-hook-form + zodResolver) para criar e editar
- [x] 2.3 Criar o formulário de Corredor com seleção da área pai
- [x] 2.4 Criar o formulário de Posição com seleção de área + corredor pai
- [x] 2.5 Adicionar as ações de remoção com confirmação, exibindo a mensagem de bloqueio quando houver dependentes
- [x] 2.6 Exibir feedback de sucesso/erro com `sonner`

## 3. Página e integração

- [x] 3.1 Substituir o placeholder de `src/app/localizacao/page.tsx` por Server Component que consome `listAreas`
- [x] 3.2 Tratar estados de armazém vazio (sem áreas) e de área/corredor sem filhos

## 4. Validação

- [x] 4.1 Rodar typecheck (`tsc --noEmit`) e build (`next build`) sem erros
- [x] 4.2 Validar os fluxos: criar/editar/remover nos três níveis, unicidade de código por nível e bloqueio de remoção com dependentes
