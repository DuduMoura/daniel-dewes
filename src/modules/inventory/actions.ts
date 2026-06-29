"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { syncAlerts } from "@/modules/alerts/service";
import { requireRole } from "@/lib/require-role";
import {
  openInventorySchema,
  countSchema,
  closeInventorySchema,
} from "./schema";

type ActionResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string[]> };

function revalidate() {
  revalidatePath("/inventario");
  revalidatePath("/produtos");
  revalidatePath("/alertas");
  revalidatePath("/");
}

// Abre um inventário e tira o snapshot do saldo (StockItem) no escopo.
export async function openInventory(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR", "OPERADOR");
  const parsed = openInventorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const { areaIds, note } = parsed.data;

  // No máximo um inventário ABERTO por vez.
  const existing = await db.inventory.findFirst({ where: { status: "ABERTO" } });
  if (existing) {
    return {
      ok: false,
      errors: { _: ["Já existe um inventário em andamento. Encerre-o antes de abrir outro."] },
    };
  }

  // Snapshot: pares produto/posição com saldo > 0 no escopo (filtro por área).
  const stockItems = await db.stockItem.findMany({
    where: {
      quantity: { gt: 0 },
      ...(areaIds.length > 0
        ? { position: { aisle: { areaId: { in: areaIds } } } }
        : {}),
    },
    select: { productId: true, positionId: true, quantity: true },
  });

  if (stockItems.length === 0) {
    return {
      ok: false,
      errors: { _: ["Não há estoque para inventariar no escopo selecionado."] },
    };
  }

  await db.inventory.create({
    data: {
      note: note || null,
      items: {
        create: stockItems.map((s) => ({
          productId: s.productId,
          positionId: s.positionId,
          systemQty: s.quantity,
        })),
      },
    },
  });

  revalidate();
  return { ok: true };
}

// Registra a contagem física de um item e calcula a diferença.
export async function saveCount(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR", "OPERADOR");
  const parsed = countSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const { itemId, countedQty } = parsed.data;

  const item = await db.inventoryItem.findUnique({ where: { id: itemId } });
  if (!item) {
    return { ok: false, errors: { _: ["Item de inventário não encontrado"] } };
  }

  await db.inventoryItem.update({
    where: { id: itemId },
    data: { countedQty, difference: countedQty - item.systemQty },
  });

  revalidatePath("/inventario");
  return { ok: true };
}

// Encerra o inventário ajustando o saldo de cada item contado (atômico).
export async function closeInventory(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR", "OPERADOR");
  const parsed = closeInventorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const { inventoryId } = parsed.data;

  const inventory = await db.inventory.findUnique({
    where: { id: inventoryId },
    include: { items: true },
  });
  if (!inventory || inventory.status !== "ABERTO") {
    return { ok: false, errors: { _: ["Inventário não está aberto"] } };
  }

  // Apenas itens contados ajustam o saldo; não contados ficam inalterados.
  const counted = inventory.items.filter(
    (it) => it.countedQty !== null && it.positionId !== null,
  );

  await db.$transaction(async (tx) => {
    for (const it of counted) {
      // Ajuste para o valor absoluto contado (a realidade física).
      await tx.stockItem.update({
        where: {
          productId_positionId: {
            productId: it.productId,
            positionId: it.positionId!,
          },
        },
        data: { quantity: it.countedQty! },
      });
    }
    await tx.inventory.update({
      where: { id: inventoryId },
      data: { status: "FECHADO", closedAt: new Date() },
    });
  });

  // O saldo dos produtos ajustados mudou — reavalia os alertas (fora da transação).
  const affectedProducts = [...new Set(counted.map((it) => it.productId))];
  for (const productId of affectedProducts) {
    await syncAlerts(productId);
  }

  revalidate();
  return { ok: true };
}
