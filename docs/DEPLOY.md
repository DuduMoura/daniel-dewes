# Deploy no Render

Guia para subir o Sistema WMS (Next.js 16 + Prisma 7 + PostgreSQL) no [Render](https://render.com).

## Por que Render funciona bem aqui

- O web service é **long-running** (não é serverless), então uma única `DATABASE_URL`
  serve tanto para o runtime quanto para as migrations — sem o split pooled/non-pooled
  que o Vercel + Supabase exige.
- O build do Render **não tem acesso ao banco**. Não tem problema: todas as páginas são
  `export const dynamic = "force-dynamic"`, então o `next build` não consulta o banco.
  As migrations rodam no **start** (runtime), onde o banco já está acessível.

## Opção A — Blueprint (recomendado, 1 clique)

O arquivo [`render.yaml`](../render.yaml) na raiz descreve o banco + o web service.

1. Faça commit e push dos arquivos de deploy para o GitHub (veja o fim deste doc).
2. No painel do Render: **New → Blueprint**.
3. Selecione o repositório `sistemaWMS`. O Render lê o `render.yaml` e mostra os recursos
   que vai criar (um Postgres `wms-db` + um web service `sistema-wms`).
4. Clique em **Apply**. O Render cria o banco, injeta a `DATABASE_URL` no web service,
   roda o build e sobe a aplicação.
5. Acesse a URL pública gerada (algo como `https://sistema-wms.onrender.com`).

## Opção B — Manual (sem Blueprint)

1. **New → PostgreSQL.** Nome `wms-db`, plano à sua escolha. Copie a **Internal Database URL**.
2. **New → Web Service**, conectado ao repositório `sistemaWMS`. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm ci && npx prisma generate && npx next build`
   - **Start Command:** `npx prisma migrate deploy && npm run start`
   - **Health Check Path:** `/`
   - **Environment Variables:** `DATABASE_URL` = a Internal Database URL do passo 1.
3. Create Web Service. O primeiro deploy roda o build, aplica as migrations e sobe o app.

## Variáveis de ambiente

| Variável | Valor | Para quê |
|---|---|---|
| `DATABASE_URL` | Internal Database URL do Postgres do Render | runtime + migrations |

Não é preciso `NODE_ENV` (o `next start` já roda em produção) nem `PORT`
(o Render injeta e o `next start` respeita automaticamente).

> **Atenção:** não defina `NODE_ENV=production` como variável de build no Render —
> isso faz o `npm ci` pular as devDependencies (`prisma`, `typescript`, `tailwind`),
> e o build quebra. Deixe o Next cuidar disso.

## Depois do deploy

- O banco sobe **vazio** (não há seed). Cadastre dados pela própria aplicação ou conecte
  via `psql`/Prisma Studio usando a **External Database URL** do Render.
- **Sem autenticação:** o app não tem login (decisão adiada no `AGENTS.md`). Publicado,
  fica aberto. Se for ambiente real, restrinja o acesso ou implemente a auth antes.

## Notas sobre o plano grátis

- **Postgres grátis** expira em ~90 dias. Para algo duradouro, troque `plan: free` por
  `basic-256mb` (ou superior) no `render.yaml` / painel.
- **Web service grátis** hiberna após 15 min sem tráfego (primeiro acesso seguinte é lento).
  Troque para `starter` para ficar sempre ativo.
- 512 MB de RAM no grátis pode ser apertado para o `next build`. Se o build der OOM,
  suba o plano do web service.

## Comandos git para versionar o deploy

```bash
git add render.yaml .node-version .env.example .gitignore docs/DEPLOY.md
git commit -m "chore: configuração de deploy no Render"
git push
```
