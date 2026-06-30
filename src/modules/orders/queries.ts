import { db } from "@/lib/db";

export type OrderListItem = Awaited<ReturnType<typeof listOrders>>[number];
export type OrderDetail = Awaited<ReturnType<typeof getOrder>>;

// Lista de pedidos com estado e contagem de itens, mais recentes primeiro.
export async function listOrders() {
  return db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });
}

// Pedido com seus itens (produto + posição de coleta com endereço).
export async function getOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          pickedFrom: { include: { aisle: { include: { area: true } } } },
        },
      },
    },
  });
}
