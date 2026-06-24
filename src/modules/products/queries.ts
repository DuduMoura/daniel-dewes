import { db } from "@/lib/db";

// Leituras do módulo de produtos — consumidas por Server Components.

export type ListProductsFilters = {
  search?: string;
  categoryId?: string;
};

export type ProductListItem = Awaited<
  ReturnType<typeof listProducts>
>[number];

// Lista produtos com busca por nome e filtro por categoria.
// O saldo total de cada produto vem de UMA agregação por posição
// (groupBy), evitando N+1.
export async function listProducts(filters: ListProductsFilters = {}) {
  const { search, categoryId } = filters;

  const products = await db.product.findMany({
    where: {
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { name: "asc" },
    include: { category: true },
  });

  if (products.length === 0) return [];

  // Saldo total por produto: uma única agregação para todos os produtos listados.
  const balances = await db.stockItem.groupBy({
    by: ["productId"],
    where: { productId: { in: products.map((p) => p.id) } },
    _sum: { quantity: true },
  });
  const balanceByProduct = new Map(
    balances.map((b) => [b.productId, b._sum.quantity ?? 0]),
  );

  return products.map((product) => ({
    ...product,
    totalQuantity: balanceByProduct.get(product.id) ?? 0,
  }));
}

export async function getProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      suppliers: true,
      stockItems: { include: { position: true } },
    },
  });
}

// Saldo total do produto (soma do estoque em todas as posições) — "tempo real".
export async function getProductBalance(productId: string) {
  const result = await db.stockItem.aggregate({
    where: { productId },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}
