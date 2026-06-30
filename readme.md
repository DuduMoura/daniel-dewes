# Sistema de Gestão de Armazém (WMS)

Projeto desenvolvido como trabalho final da disciplina de AI Software Engineering Challenge.

O sistema tem como objetivo resolver os problemas de gestão manual em armazéns e depósitos, oferecendo controle de entrada e saída de produtos, localização de itens, controle de estoque mínimo e realização de inventário — tudo de forma organizada e em tempo real.

## Sobre o Projeto

O desenvolvimento segue um fluxo estruturado de etapas:

1. **PRD** — Define o problema, o público-alvo, as funcionalidades e os fluxos do sistema
2. **Specification** — Detalha os requisitos com base no PRD aprovado
3. **Plano Técnico** — Define como o sistema será construído
4. **Implementação** — Construção da solução
5. **Validação** — Verificação da qualidade do que foi entregue

## Funcionalidades

- **Controle de entrada e saída** — Registro de movimentações de produtos no armazém
- **Localização de itens** — Identificação rápida de onde cada produto está armazenado
- **Controle de estoque mínimo** — Alertas quando produtos atingem o nível crítico
- **Inventário** — Conferência e ajuste do estoque de forma organizada

## Contribuidores

| Nome | GitHub |
|---|---|
| Samuel Maciel | [@sammsts](https://github.com/sammsts) |
| Yuri Carvalho | [@AtomicWorm](https://github.com/AtomicWorm) |
| Cesario Stoquero | [@CesarioStoquero](https://github.com/CesarioStoquero) |
| Daniel Dewes | [@DanielSDewes](https://github.com/DanielSDewes) |

---


# 📦 SistemaWMS — Sistema de Controle de Estoque

Sistema web para gerenciamento de estoque (WMS) com controle de produtos, movimentações e auditoria completa de ações por usuário.

## 🛠 Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (Pages Router) |
| Linguagem | TypeScript 5 |
| Banco de Dados | PostgreSQL |
| ORM | Prisma 6 |
| Autenticação | NextAuth.js 4 (JWT) |
| Validação | Zod |
| Formulários | React Hook Form |
| Estado assíncrono | TanStack Query (React Query) v5 |
| Estilização | Tailwind CSS v4 |

## 📁 Estrutura do Projeto

```
sistemaWMS/
├── pages/
│   ├── _app.tsx              # Configuração global da aplicação
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth].ts  # Handler NextAuth
│   │   │   └── register.ts       # Cadastro de usuários
│   │   ├── produtos/
│   │   │   ├── index.ts          # GET (listar) / POST (criar)
│   │   │   └── [id].ts           # GET / PUT / DELETE por ID
│   │   └── estoque/
│   │       └── baixar.ts         # POST baixa de estoque
│   ├── auth/
│   │   ├── signin.tsx            # Tela de login
│   │   └── register.tsx          # Tela de cadastro
│   ├── produtos/
│   │   ├── index.tsx             # Listagem de produtos
│   │   ├── novo.tsx              # Cadastro de produto
│   │   └── [id]/editar.tsx       # Edição de produto
│   └── estoque/
│       └── baixar.tsx            # Tela de baixa de estoque
├── prisma/
│   ├── schema.prisma             # Modelos e relações do banco
│   └── migrations/               # Histórico de migrações
├── lib/
│   ├── prisma.ts                 # Instância singleton do PrismaClient
│   └── logging.ts                # Utilitário de criação de logs
├── app/
│   ├── layout.tsx                # Layout raiz (App Router)
│   └── globals.css               # Estilos globais
└── docs/
    ├── ARCHITECTURE.md           # Arquitetura do sistema
    ├── DATABASE.md               # Modelagem do banco de dados
    └── API.md                    # Documentação das rotas da API
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 20+
- PostgreSQL 15+

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/DuduMoura/daniel-dewes.git
cd daniel-dewes

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 4. Execute as migrações do banco
npx prisma migrate dev

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## ⚙️ Variáveis de Ambiente

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sistemawms"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

## 📄 Documentação Técnica

- [Arquitetura do Sistema](./docs/ARCHITECTURE.md)
- [Modelagem do Banco de Dados](./docs/DATABASE.md)
- [Documentação da API](./docs/API.md)

## 👥 Perfis de Acesso

| Role | Permissões |
|---|---|
| `ADMIN` | Acesso total: gerenciar usuários, produtos e estoque |
| `GERENTE` | Criar/editar produtos e realizar movimentações de estoque |
| `OPERADOR` | Apenas realizar baixas de estoque |
| `USUARIO` | Somente visualização |
