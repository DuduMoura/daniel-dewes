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
