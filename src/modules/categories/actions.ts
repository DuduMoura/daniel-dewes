"use server";
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { categorySchema } from "./schema";

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

export async function createCategory(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR");
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.category.create({ data: parsed.data });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, errors: { name: ["Já existe uma categoria com este nome"] } };
    }
    throw error;
  }

  revalidatePath("/produtos");
  return { ok: true };
}
