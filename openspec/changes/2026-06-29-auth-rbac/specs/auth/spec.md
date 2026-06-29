# Capability: auth

## Overview
Login e logout com credenciais (email + bcrypt). Sessão JWT em cookie httpOnly.

## Behaviors

### Login (`/login`)
- Exibe formulário com campos email e senha
- Valida no cliente (Zod + react-hook-form): email obrigatório e válido, senha obrigatória
- Ao submeter: chama `loginAction`
  - **Sucesso**: redireciona para `/`
  - **Erro de credenciais**: exibe mensagem "Email ou senha incorretos"
  - **Loading**: botão desabilitado durante requisição
- Se já autenticado ao acessar `/login`: redireciona para `/`

### Logout
- Botão "Sair" no rodapé da sidebar
- Chama `logoutAction`: limpa o cookie e redireciona para `/login`

### Proteção de rotas
- Qualquer rota (exceto `/login`, `/_next/*`, `/api/*`, `/favicon.ico`) sem sessão válida: redirect para `/login`
- Sessão expirada (JWT vencido): tratada como ausente → redirect para `/login`

## States

### Login page
- **Default**: formulário vazio
- **Loading**: botão "Entrando…" desabilitado
- **Erro**: mensagem de erro inline (sem revelar se email existe ou não)
- **Já autenticado**: não renderiza (redirect no servidor)
