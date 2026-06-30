-- Bootstrap do usuário administrador (GESTOR).
--
-- Por que aqui e não no seed: no ambiente de deploy (Render) o seed depende do
-- startCommand/variáveis de ambiente, que não estavam disponíveis de forma
-- confiável. Migrations, ao contrário, rodam SEMPRE via `prisma migrate deploy`.
-- Logo, criar o admin aqui garante o primeiro acesso sem depender de nada externo.
--
-- O valor abaixo é um hash bcrypt (cost 12) — não a senha em texto puro.
-- Idempotente: se o usuário já existir, apenas redefine a senha/role.
-- RECOMENDADO: troque a senha após o primeiro login (e considere repo privado).

INSERT INTO "User" ("id", "name", "email", "role", "passwordHash", "createdAt", "updatedAt")
VALUES (
  'usr_bootstrap_admin',
  'Administrador',
  'danielsilvadewe@gmail.com',
  'GESTOR'::"Role",
  '$2y$12$A1tb7qAIIY4D3fQhs9qP../KfgD2hUtSypy0oEptWTsa4mM1SPUua',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE
  SET "passwordHash" = EXCLUDED."passwordHash",
      "role" = 'GESTOR'::"Role";
