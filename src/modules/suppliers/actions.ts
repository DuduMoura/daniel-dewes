"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { supplierSchema, updateSupplierSchema } from "./schema";

type ActionResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string[]> };

export async function createSupplier(input: unknown): Promise<ActionResult> {
  const parsed = supplierSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { email, phone, contact, productIds, ...rest } = parsed.data;
  await db.supplier.create({
    data: {
      ...rest,
      email: email || null,
      phone: phone || null,
      contact: contact || null,
      products: { connect: productIds.map((id) => ({ id })) },
    },
  });

  revalidatePath("/fornecedores");
  return { ok: true };
}

export async function updateSupplier(input: unknown): Promise<ActionResult> {
  const parsed = updateSupplierSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { id, email, phone, contact, productIds, ...rest } = parsed.data;
  await db.supplier.update({
    where: { id },
    data: {
      ...rest,
      ...(email !== undefined ? { email: email || null } : {}),
      ...(phone !== undefined ? { phone: phone || null } : {}),
      ...(contact !== undefined ? { contact: contact || null } : {}),
      // `set` substitui o conjunto inteiro de produtos pela seleção atual.
      ...(productIds !== undefined
        ? { products: { set: productIds.map((pid) => ({ id: pid })) } }
        : {}),
    },
  });

  revalidatePath("/fornecedores");
  return { ok: true };
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  await db.supplier.delete({ where: { id } });
  revalidatePath("/fornecedores");
  return { ok: true };
}
