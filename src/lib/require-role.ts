import { getSession, type SessionUser, type Role } from "@/lib/session";

/** Garante que há sessão válida. Lança erro se não autenticado. */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Não autenticado.");
  return session;
}

/** Garante que o usuário logado tem um dos roles informados. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const session = await requireSession();
  if (!roles.includes(session.role)) {
    throw new Error(
      `Acesso negado. Esta ação requer o perfil: ${roles.join(" ou ")}.`,
    );
  }
  return session;
}
