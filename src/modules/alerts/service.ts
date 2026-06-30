import { db } from "@/lib/db";

// Reconciliação dos alertas de estoque mínimo (estado derivado do saldo).
//
// NÃO é um Server Action ('use server') — é uma função de serviço chamada
// internamente pela action de movimentação e pelo Server Component da página.
// Idempotente: rodar duas vezes seguidas não muda o resultado, e cada produto
// mantém no máximo UM alerta ABERTO por vez.
//
// Passe `productId` para reavaliar só um produto (após uma movimentação);
// omita para reavaliar todos (sync completo ao abrir a página).
export async function syncAlerts(productId?: string): Promise<void> {
  const products = await db.product.findMany({
    where: productId ? { id: productId } : undefined,
    select: { id: true, minStock: true },
  });
  if (products.length === 0) return;

  // Saldo total por produto numa única agregação (evita N+1).
  const balances = await db.stockItem.groupBy({
    by: ["productId"],
    where: { productId: { in: products.map((p) => p.id) } },
    _sum: { quantity: true },
  });
  const balanceByProduct = new Map(
    balances.map((b) => [b.productId, b._sum.quantity ?? 0]),
  );

  // Alertas ABERTOS existentes dos produtos avaliados.
  const openAlerts = await db.alert.findMany({
    where: { status: "ABERTO", productId: { in: products.map((p) => p.id) } },
  });
  const openByProduct = new Map(openAlerts.map((a) => [a.productId, a]));

  for (const product of products) {
    const balance = balanceByProduct.get(product.id) ?? 0;
    const open = openByProduct.get(product.id);
    const belowMin = balance < product.minStock;

    if (belowMin && !open) {
      // Abre um novo alerta com o snapshot atual.
      await db.alert.create({
        data: {
          productId: product.id,
          currentQty: balance,
          minStock: product.minStock,
        },
      });
    } else if (belowMin && open) {
      // Mantém aberto; só atualiza a quantidade atual se mudou.
      if (open.currentQty !== balance) {
        await db.alert.update({
          where: { id: open.id },
          data: { currentQty: balance },
        });
      }
    } else if (!belowMin && open) {
      // Saldo recuperou — resolve.
      await db.alert.update({
        where: { id: open.id },
        data: { status: "RESOLVIDO", resolvedAt: new Date() },
      });
    }
  }
}
