import { db } from "@/lib/db";

export type OpenAlert = Awaited<ReturnType<typeof listOpenAlerts>>[number];

// Alertas em aberto, com o produto e seus fornecedores (para reposição),
// do mais recente para o mais antigo.
export async function listOpenAlerts() {
  return db.alert.findMany({
    where: { status: "ABERTO" },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          suppliers: { select: { id: true, name: true } },
        },
      },
    },
  });
}

// Conta alertas ABERTOS criados após a última visita do usuário à tela de alertas.
// Se `lastSeenAt` for null, todos os alertas abertos são considerados novos.
export async function countUnreadAlerts(
  userId: string,
  lastSeenAt: Date | null,
): Promise<number> {
  return db.alert.count({
    where: {
      status: "ABERTO",
      ...(lastSeenAt ? { createdAt: { gt: lastSeenAt } } : {}),
    },
  });
}
