"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { syncAlerts } from "@/modules/alerts/service";
import { createOrderSchema, pickItemSchema, orderIdSchema } from "./schema";
import { requireRole } from "@/lib/require-role";

type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; errors: Record<string, string[]> };

class InsufficientStockError extends Error {}

function revalidate() {
  revalidatePath("/pedidos");
  revalidatePath("/movimentacoes");
  revalidatePath("/produtos");
  revalidatePath("/alertas");
  revalidatePath("/");
}

// Saldo de um produto numa posição (dentro ou fora de transação).
async function balanceAt(
  client: typeof db,
  productId: string,
  positionId: string,
) {
  const s = await client.stockItem.findUnique({
    where: { productId_positionId: { productId, positionId } },
  });
  return s?.quantity ?? 0;
}

export async function createOrder(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR", "OPERADOR");
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const { note, items } = parsed.data;
  const order = await db.order.create({
    data: {
      note: note || null,
      items: {
        create: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
      },
    },
  });
  revalidate();
  return { ok: true, id: order.id };
}

// Confirma a coleta de um item de uma posição com saldo suficiente.
export async function pickItem(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR", "OPERADOR");
  const parsed = pickItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const { itemId, positionId } = parsed.data;

  const item = await db.orderItem.findUnique({
    where: { id: itemId },
    include: { order: true },
  });
  if (!item) return { ok: false, errors: { _: ["Item não encontrado"] } };
  if (item.order.status !== "ABERTO") {
    return { ok: false, errors: { _: ["O pedido não está aberto"] } };
  }

  const available = await balanceAt(db, item.productId, positionId);
  if (available < item.quantity) {
    return {
      ok: false,
      errors: { _: [`Saldo insuficiente nesta posição (disponível: ${available})`] },
    };
  }

  await db.orderItem.update({
    where: { id: itemId },
    data: { pickedFromPositionId: positionId, picked: true },
  });
  revalidatePath("/pedidos");
  return { ok: true };
}

// Expede o pedido: baixa de estoque + SAÍDA por item, tudo atômico.
export async function shipOrder(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR", "OPERADOR");
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const { orderId } = parsed.data;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order || order.status !== "ABERTO") {
    return { ok: false, errors: { _: ["O pedido não está aberto"] } };
  }
  const allPicked = order.items.every(
    (it) => it.picked && it.pickedFromPositionId,
  );
  if (!allPicked) {
    return {
      ok: false,
      errors: { _: ["Há itens sem coleta confirmada"] },
    };
  }

  try {
    await db.$transaction(async (tx) => {
      for (const it of order.items) {
        const positionId = it.pickedFromPositionId!;
        // Revalida o saldo dentro da transação (pode ter mudado desde a coleta).
        const current = await tx.stockItem.findUnique({
          where: {
            productId_positionId: { productId: it.productId, positionId },
          },
        });
        if (!current || current.quantity < it.quantity) {
          throw new InsufficientStockError();
        }
        await tx.stockItem.update({
          where: {
            productId_positionId: { productId: it.productId, positionId },
          },
          data: { quantity: { decrement: it.quantity } },
        });
        await tx.movement.create({
          data: {
            type: "SAIDA",
            productId: it.productId,
            quantity: it.quantity,
            fromPositionId: positionId,
            note: `Pedido ${order.id}`,
          },
        });
      }
      await tx.order.update({
        where: { id: orderId },
        data: { status: "EXPEDIDO", shippedAt: new Date() },
      });
    });
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return {
        ok: false,
        errors: {
          _: ["Saldo insuficiente em uma das posições; expedição cancelada"],
        },
      };
    }
    throw error;
  }

  // O saldo dos produtos caiu — reavalia os alertas (fora da transação).
  const affected = [...new Set(order.items.map((it) => it.productId))];
  for (const productId of affected) await syncAlerts(productId);

  revalidate();
  return { ok: true };
}

export async function cancelOrder(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR", "OPERADOR");
  const parsed = orderIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const { orderId } = parsed.data;

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "ABERTO") {
    return { ok: false, errors: { _: ["O pedido não está aberto"] } };
  }
  await db.order.update({
    where: { id: orderId },
    data: { status: "CANCELADO" },
  });
  revalidate();
  return { ok: true };
}
