// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("../src/generated/prisma");
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "❌  Defina SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD no .env antes de rodar o seed.",
    );
    process.exit(1);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`ℹ️  Usuário ${email} já existe. Nenhuma ação necessária.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { name: "Administrador", email, passwordHash, role: "GESTOR" },
  });

  console.log(`✅  Usuário GESTOR criado: ${user.email} (id: ${user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
