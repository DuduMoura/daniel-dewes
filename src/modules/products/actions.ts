"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { productSchema, updateProductSchema } from "./schema";

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

export async function createProduct(input: unknown): Promise<ActionResult> {
  // O MESMO schema do formulário valida de novo aqui, no servidor.
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { description, categoryId, ...rest } = parsed.data;
  try {
    await db.product.create({
      data: {
        ...rest,
        description: description || null,
        categoryId: categoryId || null,
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, errors: { sku: ["Já existe um produto com este SKU"] } };
    }
    throw error;
  }

  revalidatePath("/produtos");
  return { ok: true };
}

export async function updateProduct(input: unknown): Promise<ActionResult> {
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { id, description, categoryId, ...rest } = parsed.data;
  try {
    await db.product.update({
      where: { id },
      data: {
        ...rest,
        ...(description !== undefined ? { description: description || null } : {}),
        ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, errors: { sku: ["Já existe um produto com este SKU"] } };
    }
    throw error;
  }

  revalidatePath("/produtos");
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await db.product.delete({ where: { id } });
  revalidatePath("/produtos");
  return { ok: true };
}
