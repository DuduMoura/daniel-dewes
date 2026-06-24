"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { syncAlerts } from "@/modules/alerts/service";
import { movementSchema } from "./schema";

type ActionResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string[]> };

// Erro de domínio usado para abortar a transação quando o saldo é insuficiente.
class InsufficientStockError extends Error {}

function blank(v: string | undefined): string | undefined {
  return v ? v : undefined;
}

export async function registerMovement(input: unknown): Promise<ActionResult> {
  // O MESMO schema do formulário valida de novo aqui, no servidor.
  const parsed = movementSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { type, productId, quantity, direction, note } = parsed.data;
  const fromPositionId = blank(parsed.data.fromPositionId);
  const toPositionId = blank(parsed.data.toPositionId);
  const supplierId = blank(parsed.data.supplierId);

  // Resolve o efeito no saldo a partir do tipo (e direção, na devolução).
  let incPositionId: string | undefined;
  let decPositionId: string | undefined;
  switch (type) {
    case "ENTRADA":
      incPositionId = toPositionId;
      break;
    case "SAIDA":
      decPositionId = fromPositionId;
      break;
    case "DEVOLUCAO":
      if (direction === "CLIENTE") incPositionId = toPositionId;
      else decPositionId = fromPositionId;
      break;
    case "TRANSFERENCIA":
      decPositionId = fromPositionId;
      incPositionId = toPositionId;
      break;
  }

  try {
    // Regra de ouro nº 2: movimento + saldo são atômicos.
    await db.$transaction(async (tx) => {
      // Decremento guardado: valida saldo suficiente antes de subtrair.
      if (decPositionId) {
        const current = await tx.stockItem.findUnique({
          where: {
            productId_positionId: { productId, positionId: decPositionId },
          },
        });
        if (!current || current.quantity < quantity) {
          throw new InsufficientStockError();
        }
        await tx.stockItem.update({
          where: {
            productId_positionId: { productId, positionId: decPositionId },
          },
          data: { quantity: { decrement: quantity } },
        });
      }

      // Incremento via upsert: cria a posição-saldo se ainda não existir.
      if (incPositionId) {
        await tx.stockItem.upsert({
          where: {
            productId_positionId: { productId, positionId: incPositionId },
          },
          create: { productId, positionId: incPositionId, quantity },
          update: { quantity: { increment: quantity } },
        });
      }

      await tx.movement.create({
        data: {
          type,
          productId,
          quantity,
          note: note || null,
          fromPositionId: fromPositionId ?? null,
          toPositionId: toPositionId ?? null,
          supplierId: supplierId ?? null,
        },
      });
    });
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return {
        ok: false,
        errors: { _: ["Saldo insuficiente na posição de origem"] },
      };
    }
    throw error;
  }

  // O saldo do produto mudou — reavalia a condição de alerta de estoque
  // mínimo (fora da transação: efeito derivado, não desfaz a movimentação).
  await syncAlerts(productId);

  // O saldo mudou — revalida as telas que o exibem.
  revalidatePath("/movimentacoes");
  revalidatePath("/produtos");
  revalidatePath("/alertas");
  revalidatePath("/");
  return { ok: true };
}
