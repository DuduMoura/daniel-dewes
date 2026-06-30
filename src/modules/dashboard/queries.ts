import { db } from "@/lib/db";

// Resumo para o dashboard — leituras agregadas consumidas pelo Server Component.
export async function getDashboardSummary() {
  const [products, suppliers, openAlerts, openInventories, stock] =
    await Promise.all([
      db.product.count(),
      db.supplier.count(),
      db.alert.count({ where: { status: "ABERTO" } }),
      db.inventory.count({ where: { status: "ABERTO" } }),
      db.stockItem.aggregate({ _sum: { quantity: true } }),
    ]);

  return {
    products,
    suppliers,
    openAlerts,
    openInventories,
    totalUnits: stock._sum.quantity ?? 0,
  };
}
