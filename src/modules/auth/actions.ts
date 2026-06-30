"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, deleteSession, getSession } from "@/lib/session";
import { loginSchema } from "./schema";
import { countUnreadAlerts } from "@/modules/alerts/queries";

type LoginResult =
  | { ok: true; unreadAlerts?: number }
  | { ok: false; error: string };

export async function loginAction(input: unknown): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Email ou senha incorretos." };
  }

  const { email, password } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return { ok: false, error: "Email ou senha incorretos." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Email ou senha incorretos." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  // Para COMPRAS: retorna contagem de alertas não lidos para exibir toast
  if (user.role === "COMPRAS") {
    const unreadAlerts = await countUnreadAlerts(user.id, user.alertsLastSeenAt);
    return { ok: true, unreadAlerts };
  }

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

export async function getCurrentUser() {
  return getSession();
}
