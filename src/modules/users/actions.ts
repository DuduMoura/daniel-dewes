"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
} from "./schema";

type ActionResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string[]> };

const SALT_ROUNDS = 12;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function createUser(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR");

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password, role } = parsed.data;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    await db.user.create({ data: { name, email, passwordHash, role } });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { ok: false, errors: { email: ["Este email já está em uso"] } };
    }
    throw error;
  }

  revalidatePath("/usuarios");
  return { ok: true };
}

export async function updateUser(input: unknown): Promise<ActionResult> {
  const session = await requireRole("GESTOR");

  const parsed = updateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { id, name, role } = parsed.data;

  // Gestor não pode rebaixar o próprio perfil
  if (id === session.id && role !== "GESTOR") {
    return {
      ok: false,
      errors: { role: ["Você não pode alterar o próprio perfil"] },
    };
  }

  await db.user.update({ where: { id }, data: { name, role } });
  revalidatePath("/usuarios");
  return { ok: true };
}

export async function resetPassword(input: unknown): Promise<ActionResult> {
  await requireRole("GESTOR");

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { id, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await db.user.update({ where: { id }, data: { passwordHash } });
  revalidatePath("/usuarios");
  return { ok: true };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await requireRole("GESTOR");

  if (id === session.id) {
    return {
      ok: false,
      errors: { _: ["Você não pode excluir o próprio usuário"] },
    };
  }

  await db.user.delete({ where: { id } });
  revalidatePath("/usuarios");
  return { ok: true };
}
