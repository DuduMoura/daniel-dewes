# Capability: users

## Overview
CRUD de usuários em `/usuarios`, acessível apenas por GESTOR.

## Behaviors
- Listar usuários com nome, email, perfil e data de criação
- Criar usuário (nome, email, senha ≥ 8 chars, role)
- Editar nome e role (GESTOR não pode alterar o próprio role)
- Redefinir senha (dialog separado)
- Excluir (GESTOR não pode excluir a si mesmo)

## Restrições
- Rota protegida: acesso negado → redirect para `/` para OPERADOR e COMPRAS
- Email único; violação retorna erro inline no formulário
