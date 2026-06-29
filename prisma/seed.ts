import "dotenv/config";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "⚠️   SEED_ADMIN_EMAIL ou SEED_ADMIN_PASSWORD não definidos — seed ignorado.",
    );
    return;
  }

  // Importa o PrismaClient após o dotenv ter carregado o DATABASE_URL
  const { db } = await import("../src/lib/db");

  const passwordHash = await bcrypt.hash(password, 12);

  // Upsert: cria o GESTOR se não existir, ou redefine a senha/role se já existir.
  // Assim o SEED_ADMIN_PASSWORD é sempre a fonte de verdade do admin bootstrap.
  const user = await db.user.upsert({
    where: { email },
    update: { passwordHash, role: "GESTOR" },
    create: { name: "Administrador", email, passwordHash, role: "GESTOR" },
  });

  console.log(`✅  Admin GESTOR pronto: ${user.email} (id: ${user.id})`);
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
