# Capability: auth

## Overview
Autenticação via credenciais (email + bcrypt). Sessão JWT em cookie httpOnly `wms_session`.

## Behaviors

### Login (`/login`)
- Form com email e senha; valida com Zod no cliente e servidor
- Credenciais corretas → sessão criada → redirect para `/`
- Credenciais erradas → mensagem "Email ou senha incorretos" (não revela se email existe)
- Já autenticado → redirect imediato para `/`

### Logout
- Botão na sidebar (ícone `LogOut`); chama `logoutAction` → cookie removido → redirect para `/login`

### Proteção de rotas
- Middleware verifica `wms_session` em toda rota exceto `/login` e assets
- JWT expirado ou inválido → redirect para `/login` + cookie removido

## Perfis (Role)
| Role | Descrição |
|---|---|
| `GESTOR` | Acesso total, incluindo gestão de usuários |
| `OPERADOR` | Movimentações, pedidos, inventário, produtos e localização |
| `COMPRAS` | Alertas, fornecedores e produtos (leitura) |
