# 🗄️ Modelagem do Banco de Dados — SistemaWMS

## Provedor

**PostgreSQL 15+** gerenciado via **Prisma ORM 6**.

---

## Diagrama Entidade-Relacionamento

```
┌──────────────────────────────────┐
│            Usuario               │
├──────────────────────────────────┤
│ id            String  PK (CUID)  │
│ nome          String?            │
│ email         String? UNIQUE     │
│ password      String? (HASH)     │
│ role          UsuarioRole        │
│ criadoEm      DateTime           │
│ atualizadoEm  DateTime           │
└────────┬─────────────────────────┘
         │ 1
         ├──────────────────────────────────────────────────────────┐
         │ 1                          │ 1                   │ 1     │ 1
         ▼ N                          ▼ N                   ▼ N     ▼ N
┌─────────────────┐      ┌───────────────────────┐   ┌──────────┐  ┌──────────────────┐
│      Conta      │      │  MovimentacaoEstoque  │   │   Log    │  │     Sessao       │
├─────────────────┤      ├───────────────────────┤   ├──────────┤  ├──────────────────┤
│ id              │      │ id          String PK │   │ id       │  │ id               │
│ usuarioId  FK   │      │ mudancaQuantidade Int │   │ acao     │  │ sessaoToken      │
│ tipo            │      │ tipoMovimento  Enum   │   │ detalhes │  │ usuarioId   FK   │
│ provider        │      │ dataMovimento  DT     │   │ criadoEm │  │ expiraEm         │
│ providerContaId │      │ produtoId      FK     │   │ usuarioId│  └──────────────────┘
│ token_refresh   │      │ usuarioId      FK     │   │    FK?   │
│ token_acesso    │      └──────────┬────────────┘   └──────────┘
│ expira_em       │                 │ N
│ ...             │                 │
└─────────────────┘                 │ 1
                          ┌─────────▼──────────────┐
                          │        Produto          │
                          ├─────────────────────────┤
                          │ id            String PK │
                          │ nome          String    │
                          │ quantidade    Int        │
                          │ preco         Float      │
                          │ ultimoMovimentoEm DT?   │
                          │ criadoEm      DateTime  │
                          │ atualizadoEm  DateTime  │
                          └─────────────────────────┘

┌──────────────────────────────────┐
│       TokenVerificacao           │
├──────────────────────────────────┤
│ identificador  String            │
│ token          String  UNIQUE    │
│ expiraEm       DateTime          │
│ ── UNIQUE(identificador, token)  │
└──────────────────────────────────┘
```

---

## Modelos

### `Usuario`
Representa um usuário autenticado do sistema.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `String` PK | Identificador único (CUID) |
| `nome` | `String?` | Nome do usuário (opcional) |
| `email` | `String?` UNIQUE | E-mail para autenticação |
| `password` | `String?` | Hash bcrypt da senha |
| `role` | `UsuarioRole` | Perfil de acesso (default: `USUARIO`) |
| `criadoEm` | `DateTime` | Data de criação |
| `atualizadoEm` | `DateTime` | Data da última atualização |

**Relações:** `Conta[]`, `Sessao[]`, `MovimentacaoEstoque[]`, `Log[]`

---

### `Produto`
Representa um item de estoque gerenciado pelo sistema.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `String` PK | Identificador único (CUID) |
| `nome` | `String` | Nome do produto (obrigatório) |
| `quantidade` | `Int` | Quantidade atual em estoque (default: `0`) |
| `preco` | `Float` | Preço unitário (default: `0.0`) |
| `ultimoMovimentoEm` | `DateTime?` | Data da última movimentação |
| `criadoEm` | `DateTime` | Data de criação |
| `atualizadoEm` | `DateTime` | Data da última atualização |

**Relações:** `MovimentacaoEstoque[]`

---

### `MovimentacaoEstoque`
Registra cada entrada, saída ou ajuste de estoque. Funciona como um ledger imutável.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `String` PK | Identificador único (CUID) |
| `mudancaQuantidade` | `Int` | Valor positivo (entrada) ou negativo (saída) |
| `tipoMovimento` | `TipoMovimento` | Classificação da movimentação |
| `dataMovimento` | `DateTime` | Data/hora da movimentação |
| `produtoId` | `String` FK | Produto associado (`onDelete: Cascade`) |
| `usuarioId` | `String` FK | Usuário responsável pela movimentação |

---

### `Log`
Registro de auditoria de todas as ações relevantes do sistema.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `String` PK | Identificador único (CUID) |
| `acao` | `String` | Código da ação (ex: `PRODUTO_CRIADO`) |
| `detalhes` | `Json?` | Dados complementares da ação em JSON |
| `criadoEm` | `DateTime` | Data/hora do registro |
| `usuarioId` | `String?` FK | Usuário que gerou a ação (nullable para ações de sistema) |

---

### Modelos de Suporte NextAuth

#### `Conta`
Armazena tokens OAuth de provedores externos.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `String` PK | CUID |
| `usuarioId` | `String` FK | Usuário vinculado (`onDelete: Cascade`) |
| `tipo` | `String` | Tipo da conta (ex: `credentials`) |
| `provider` | `String` | Provedor (ex: `credentials`) |
| `providerContaId` | `String` | ID único no provedor |
| `token_*` | `String?` | Tokens de acesso/refresh |

**Constraint:** `UNIQUE(provider, providerContaId)`

#### `Sessao`
Gerencia sessões ativas.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `String` PK | CUID |
| `sessaoToken` | `String` UNIQUE | Token da sessão |
| `usuarioId` | `String` FK | Usuário vinculado (`onDelete: Cascade`) |
| `expiraEm` | `DateTime` | Validade da sessão |

#### `TokenVerificacao`
Tokens para verificação de e-mail (fluxo magic link).

| Campo | Tipo | Descrição |
|---|---|---|
| `identificador` | `String` | E-mail ou identificador |
| `token` | `String` UNIQUE | Token de verificação |
| `expiraEm` | `DateTime` | Validade do token |

**Constraint:** `UNIQUE(identificador, token)`

---

## Enums

### `UsuarioRole`
Define o nível de permissão do usuário no sistema.

| Valor | Descrição |
|---|---|
| `ADMIN` | Acesso total, incluindo gerenciamento de usuários |
| `GERENTE` | Cadastrar e editar produtos; gerenciar estoque |
| `OPERADOR` | Apenas realizar baixas de estoque |
| `USUARIO` | Somente visualização (acesso básico) |

### `TipoMovimento`
Classifica o tipo de movimentação de estoque.

| Valor | Descrição | `mudancaQuantidade` |
|---|---|---|
| `ESTOQUE_INICIAL` | Quantidade definida no cadastro do produto | `> 0` |
| `COMPRA_ENTRADA` | Recebimento de mercadoria | `> 0` |
| `VENDA_SAIDA` | Saída por venda | `< 0` |
| `AJUSTE_ESTOQUE` | Correção manual de inventário | `> 0` ou `< 0` |
| `PERDA_ESTOQUE` | Quebra, vencimento ou extravio | `< 0` |

---

## Regras de Negócio no Banco

1. **Integridade referencial**: a exclusão de um `Produto` cascateia para `MovimentacaoEstoque` (`onDelete: Cascade`).
2. **Saldo de estoque**: o campo `Produto.quantidade` é a fonte de verdade do estoque atual; as `MovimentacaoEstoque` representam o histórico auditável.
3. **Atomicidade**: todas as operações que envolvem `Produto` + `MovimentacaoEstoque` + `Log` são executadas em uma única transação Prisma.
4. **Senha nunca em texto puro**: o campo `Usuario.password` armazena exclusivamente hashes bcrypt.
5. **Rastreabilidade**: toda movimentação de estoque obrigatoriamente referencia um `usuarioId`.

---

## Convenções

- **IDs**: todos gerados com `cuid()` — collision-resistant, URL-safe
- **Timestamps**: `criadoEm` com `@default(now())` e `atualizadoEm` com `@updatedAt` (gerenciado automaticamente pelo Prisma)
- **Campos opcionais**: marcados com `?` (nullable no banco)
- **Nomenclatura**: modelos e campos em PascalCase/camelCase em português, alinhados ao domínio do negócio
