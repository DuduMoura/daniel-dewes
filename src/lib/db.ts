import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Singleton do Prisma para evitar múltiplas conexões em dev (hot reload).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma 7 usa driver adapter; a conexão vem da env.
// Local: DATABASE_URL. Vercel + Supabase: prefere a URL pooled
// (POSTGRES_PRISMA_URL) para o runtime serverless, com fallbacks.
const connectionString =
  process.env.DATABASE_URL ??
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL_NON_POOLING;

const adapter = new PrismaPg({ connectionString });

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
