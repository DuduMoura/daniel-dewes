# Capability: users

## Overview
CRUD de usuários, acessível exclusivamente pelo perfil GESTOR em `/usuarios`.

## Behaviors

### Listagem
- Tabela com: nome, email, perfil (badge colorido), data de criação
- Botões de ação por linha: editar, redefinir senha, excluir

### Criar usuário
- Campos: nome (obrigatório), email (obrigatório, único), perfil (select: GESTOR/OPERADOR/COMPRAS), senha (obrigatório, mín. 8 chars)
- Erro de email duplicado exibido inline

### Editar usuário
- Campos: nome, perfil (não altera senha)
- Próprio usuário não pode alterar o próprio perfil (evita auto-rebaixamento)

### Redefinir senha
- Dialog separado: nova senha + confirmação
- Só GESTOR pode redefinir senha de qualquer usuário

### Excluir usuário
- Confirmação via dialog
- Não permite excluir o próprio usuário logado

## States
- **Vazio**: mensagem "Nenhum usuário cadastrado" + botão criar
- **Erro de permissão**: redirect para `/` (OPERADOR/COMPRAS não acessa esta rota)
