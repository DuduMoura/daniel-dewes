# 🔌 Documentação da API — SistemaWMS

## Visão Geral

A API é implementada via **Next.js API Routes** (Pages Router) e segue convenções REST.  
Todos os endpoints — exceto login e cadastro — exigem autenticação via sessão JWT (NextAuth.js).

**Base URL:** `http://localhost:3000/api`

---

## Autenticação

A autenticação é gerenciada pelo **NextAuth.js** com estratégia **JWT + Credentials**.

### Fluxo de Autenticação

```
1. POST /api/auth/callback/credentials  →  credenciais validadas
2. NextAuth gera token JWT com { id, email, role }
3. Token é armazenado em cookie httpOnly
4. Endpoints protegidos verificam sessão com getServerSession()
```

### Códigos de Erro de Autenticação

| Código | Descrição |
|---|---|
| `401 Unauthorized` | Sessão ausente ou expirada |
| `403 Forbidden` | Sessão válida, mas Role sem permissão |

---

## Endpoints

---

### Auth — Autenticação

#### `POST /api/auth/register`
Cria um novo usuário no sistema. O role padrão é `USUARIO`.

**Autenticação:** Não requerida

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "minimo6chars",
  "name": "Nome Opcional"
}
```

**Respostas:**

| Status | Descrição |
|---|---|
| `201 Created` | Usuário criado com sucesso |
| `400 Bad Request` | Dados inválidos (validação Zod) |
| `409 Conflict` | E-mail já está em uso |
| `500 Internal Server Error` | Erro interno |

**Exemplo de resposta `201`:**
```json
{
  "id": "clxyz123",
  "email": "usuario@exemplo.com",
  "nome": "Nome Opcional",
  "role": "USUARIO",
  "criadoEm": "2026-06-29T12:00:00.000Z",
  "atualizadoEm": "2026-06-29T12:00:00.000Z"
}
```

---

#### `POST /api/auth/callback/credentials`
Autentica um usuário existente. Gerenciado internamente pelo NextAuth.

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

---

### Produtos

#### `GET /api/produtos`
Retorna a lista de todos os produtos, ordenada por nome.

**Autenticação:** Requerida (qualquer role)

**Respostas:**

| Status | Descrição |
|---|---|
| `200 OK` | Lista de produtos |
| `401 Unauthorized` | Não autenticado |
| `500 Internal Server Error` | Erro interno |

**Exemplo de resposta `200`:**
```json
[
  {
    "id": "clprod123",
    "nome": "Parafuso M8",
    "quantidade": 500,
    "preco": 0.25,
    "ultimoMovimentoEm": "2026-06-01T10:00:00.000Z",
    "criadoEm": "2026-01-01T00:00:00.000Z",
    "atualizadoEm": "2026-06-01T10:00:00.000Z"
  }
]
```

---

#### `POST /api/produtos`
Cria um novo produto. Se `quantidade > 0`, registra automaticamente uma movimentação de `ESTOQUE_INICIAL`.

**Autenticação:** Requerida — `ADMIN` ou `GERENTE`

**Body:**
```json
{
  "nome": "Parafuso M8",
  "quantidade": 500,
  "preco": 0.25
}
```

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `nome` | `string` | ✅ | Mínimo 1 caractere |
| `quantidade` | `number` | ❌ | Inteiro ≥ 0 (default: `0`) |
| `preco` | `number` | ❌ | ≥ 0 (default: `0.0`) |

**Respostas:**

| Status | Descrição |
|---|---|
| `201 Created` | Produto criado |
| `400 Bad Request` | Dados inválidos |
| `401 Unauthorized` | Não autenticado |
| `403 Forbidden` | Role sem permissão |
| `500 Internal Server Error` | Erro interno |

---

#### `GET /api/produtos/[id]`
Retorna os dados de um produto específico.

**Autenticação:** Requerida (qualquer role)

**Parâmetros de URL:**
- `id` — CUID do produto

**Respostas:**

| Status | Descrição |
|---|---|
| `200 OK` | Dados do produto |
| `401 Unauthorized` | Não autenticado |
| `404 Not Found` | Produto não encontrado |
| `500 Internal Server Error` | Erro interno |

---

#### `PUT /api/produtos/[id]`
Atualiza nome e/ou preço de um produto existente. Não altera quantidade diretamente (use `/api/estoque/baixar`).

**Autenticação:** Requerida — `ADMIN` ou `GERENTE`

**Parâmetros de URL:**
- `id` — CUID do produto

**Body** (todos os campos são opcionais, mas ao menos um deve ser enviado):
```json
{
  "name": "Parafuso M10",
  "cost": 0.35
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `name` | `string` | Mínimo 1 caractere |
| `cost` | `number` | ≥ 0 |

**Respostas:**

| Status | Descrição |
|---|---|
| `200 OK` | Produto atualizado |
| `400 Bad Request` | Dados inválidos ou sem campos para atualizar |
| `401 Unauthorized` | Não autenticado |
| `403 Forbidden` | Role sem permissão |
| `404 Not Found` | Produto não encontrado |
| `500 Internal Server Error` | Erro interno |

---

#### `DELETE /api/produtos/[id]`
Remove permanentemente um produto do sistema. As movimentações associadas também são removidas (`onDelete: Cascade`).

**Autenticação:** Requerida — `ADMIN` apenas

**Parâmetros de URL:**
- `id` — CUID do produto

**Respostas:**

| Status | Descrição |
|---|---|
| `204 No Content` | Produto removido com sucesso |
| `401 Unauthorized` | Não autenticado |
| `403 Forbidden` | Role sem permissão |
| `404 Not Found` | Produto não encontrado |
| `500 Internal Server Error` | Erro interno |

---

### Estoque

#### `POST /api/estoque/baixar`
Realiza uma baixa (saída) de estoque para um produto. Registra a movimentação como `VENDA_SAIDA`.

**Autenticação:** Requerida — `ADMIN`, `GERENTE` ou `OPERADOR`

**Body:**
```json
{
  "productId": "clprod123",
  "quantityToDecrease": 10
}
```

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `productId` | `string` (CUID) | ✅ | Deve ser um CUID válido |
| `quantityToDecrease` | `number` | ✅ | Inteiro positivo |

**Respostas:**

| Status | Descrição |
|---|---|
| `200 OK` | Baixa realizada com sucesso |
| `400 Bad Request` | Dados inválidos, produto não encontrado ou estoque insuficiente |
| `401 Unauthorized` | Não autenticado |
| `403 Forbidden` | Role sem permissão |
| `500 Internal Server Error` | Erro interno |

**Exemplo de resposta `200`:**
```json
{
  "message": "Baixa de estoque realizada com sucesso.",
  "product": {
    "id": "clprod123",
    "nome": "Parafuso M8",
    "quantidade": 490,
    "preco": 0.25,
    "ultimoMovimentoEm": "2026-06-29T15:30:00.000Z",
    "criadoEm": "2026-01-01T00:00:00.000Z",
    "atualizadoEm": "2026-06-29T15:30:00.000Z"
  }
}
```

**Exemplo de resposta `400` (estoque insuficiente):**
```json
{
  "message": "Estoque insuficiente para Parafuso M8. Disponível: 5, Tentativa de baixa: 10"
}
```

---

## Matriz de Permissões

| Endpoint | `USUARIO` | `OPERADOR` | `GERENTE` | `ADMIN` |
|---|:---:|:---:|:---:|:---:|
| `GET /api/produtos` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/produtos/[id]` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/produtos` | ❌ | ❌ | ✅ | ✅ |
| `PUT /api/produtos/[id]` | ❌ | ❌ | ✅ | ✅ |
| `DELETE /api/produtos/[id]` | ❌ | ❌ | ❌ | ✅ |
| `POST /api/estoque/baixar` | ❌ | ✅ | ✅ | ✅ |
| `POST /api/auth/register` | — | — | — | — |

---

## Logs de Auditoria

Toda operação relevante gera automaticamente um registro na tabela `Log`. Principais ações registradas:

| Ação | Descrição |
|---|---|
| `USER_REGISTERED` | Novo usuário cadastrado |
| `PRODUTO_CRIADO` | Produto criado |
| `PRODUTO_ATUALIZADO` | Produto atualizado |
| `PRODUTO_DELETADO` | Produto removido |
| `ESTOQUE_BAIXADO` | Baixa de estoque realizada |
| `PROIBIDO_CRIAR_PRODUTO` | Tentativa de criação sem permissão |
| `PROIBIDO_ATUALIZAR_PRODUTO` | Tentativa de atualização sem permissão |
| `PROIBIDO_DELETAR_PRODUTO` | Tentativa de exclusão sem permissão |
| `PROIBIDO_BAIXAR_ESTOQUE` | Tentativa de baixa sem permissão |
| `ERRO_*` | Erros internos em diversas operações |

---

## Tratamento de Erros

Todos os erros seguem o formato:

```json
{
  "message": "Descrição do erro"
}
```

Erros de validação Zod retornam detalhes por campo:

```json
{
  "errors": {
    "nome": ["Nome do produto é obrigatório."],
    "quantidade": ["Quantidade deve ser um número inteiro não negativo."]
  }
}
```
