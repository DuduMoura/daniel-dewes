import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Singleton do Prisma para evitar múltiplas conexões em dev (hot reload).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 usa driver adapter; a conexão vem da DATABASE_URL (.env).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

function hasOrdersDelegate(client: PrismaClient | undefined): client is PrismaClient {
  return typeof client?.order?.findMany === "function";
}

const cachedPrisma = hasOrdersDelegate(globalForPrisma.prisma)
  ? globalForPrisma.prisma
  : undefined;

export const db = cachedPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
