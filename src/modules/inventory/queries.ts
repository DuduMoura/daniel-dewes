import { db } from "@/lib/db";

export type OpenInventory = Awaited<ReturnType<typeof getOpenInventory>>;
export type ClosedInventory = Awaited<
  ReturnType<typeof listClosedInventories>
>[number];

// O inventário ABERTO (se houver), com seus itens, produto e rótulo de posição.
export async function getOpenInventory() {
  return db.inventory.findFirst({
    where: { status: "ABERTO" },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          position: { include: { aisle: { include: { area: true } } } },
        },
      },
    },
  });
}

// Histórico de inventários encerrados, com contagem de itens e de divergências.
export async function listClosedInventories() {
  const inventories = await db.inventory.findMany({
    where: { status: "FECHADO" },
    orderBy: { closedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  if (inventories.length === 0) return [];

  // Divergências (difference != 0) por inventário, numa agregação só.
  const diffs = await db.inventoryItem.groupBy({
    by: ["inventoryId"],
    where: {
      inventoryId: { in: inventories.map((i) => i.id) },
      difference: { not: 0 },
    },
    _count: { _all: true },
  });
  const divergByInventory = new Map(
    diffs.map((d) => [d.inventoryId, d._count._all]),
  );

  return inventories.map((inv) => ({
    ...inv,
    divergences: divergByInventory.get(inv.id) ?? 0,
  }));
}
