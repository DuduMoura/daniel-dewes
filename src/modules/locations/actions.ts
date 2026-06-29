"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import {
  areaSchema,
  updateAreaSchema,
  aisleSchema,
  updateAisleSchema,
  positionSchema,
  updatePositionSchema,
} from "./schema";

// Resultado padrão das actions: discriminado por `ok`.
type ActionResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string[]> };

// Detecta violação de unicidade do Prisma (P2002).
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

const DUP_AREA = { code: ["Já existe uma área com este código"] };
const DUP_AISLE = { code: ["Já existe um corredor com este código nesta área"] };
const DUP_POSITION = {
  code: ["Já existe uma posição com este código neste corredor"],
};

// --- Área ---

export async function createArea(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR");
  const parsed = areaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  try {
    await db.area.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, errors: DUP_AREA };
    throw error;
  }
  revalidatePath("/localizacao");
  return { ok: true };
}

export async function updateArea(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR");
  const parsed = updateAreaSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const { id, ...data } = parsed.data;
  try {
    await db.area.update({ where: { id }, data });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, errors: DUP_AREA };
    throw error;
  }
  revalidatePath("/localizacao");
  return { ok: true };
}

export async function deleteArea(id: string): Promise<ActionResult> {
  await requireRole("GESTOR");
  // Guarda de integridade: não remove área com corredores.
  const aisles = await db.aisle.count({ where: { areaId: id } });
  if (aisles > 0) {
    return {
      ok: false,
      errors: {
        _: [`Remova os ${aisles} corredor(es) desta área antes de excluí-la`],
      },
    };
  }
  await db.area.delete({ where: { id } });
  revalidatePath("/localizacao");
  return { ok: true };
}

// --- Corredor ---

export async function createAisle(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR");
  const parsed = aisleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  try {
    await db.aisle.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, errors: DUP_AISLE };
    throw error;
  }
  revalidatePath("/localizacao");
  return { ok: true };
}

export async function updateAisle(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR");
  const parsed = updateAisleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const { id, ...data } = parsed.data;
  try {
    await db.aisle.update({ where: { id }, data });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, errors: DUP_AISLE };
    throw error;
  }
  revalidatePath("/localizacao");
  return { ok: true };
}

export async function deleteAisle(id: string): Promise<ActionResult> {
  await requireRole("GESTOR");
  // Guarda de integridade: não remove corredor com posições.
  const positions = await db.position.count({ where: { aisleId: id } });
  if (positions > 0) {
    return {
      ok: false,
      errors: {
        _: [`Remova as ${positions} posição(ões) deste corredor antes de excluí-lo`],
      },
    };
  }
  await db.aisle.delete({ where: { id } });
  revalidatePath("/localizacao");
  return { ok: true };
}

// --- Posição ---

export async function createPosition(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR");
  const parsed = positionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  try {
    await db.position.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, errors: DUP_POSITION };
    throw error;
  }
  revalidatePath("/localizacao");
  return { ok: true };
}

export async function updatePosition(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR");
  const parsed = updatePositionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }
  const { id, ...data } = parsed.data;
  try {
    await db.position.update({ where: { id }, data });
  } catch (error) {
    if (isUniqueViolation(error)) return { ok: false, errors: DUP_POSITION };
    throw error;
  }
  revalidatePath("/localizacao");
  return { ok: true };
}

export async function deletePosition(id: string): Promise<ActionResult> {
  await requireRole("GESTOR");
  // Guarda de integridade: não remove posição com estoque, movimentações
  // ou itens de inventário vinculados.
  const [stock, movFrom, movTo, inv] = await Promise.all([
    db.stockItem.count({ where: { positionId: id } }),
    db.movement.count({ where: { fromPositionId: id } }),
    db.movement.count({ where: { toPositionId: id } }),
    db.inventoryItem.count({ where: { positionId: id } }),
  ]);
  if (stock + movFrom + movTo + inv > 0) {
    return {
      ok: false,
      errors: {
        _: [
          "Esta posição tem estoque, movimentações ou inventário vinculados e não pode ser removida",
        ],
      },
    };
  }
  await db.position.delete({ where: { id } });
  revalidatePath("/localizacao");
  return { ok: true };
}
