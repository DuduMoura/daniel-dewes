"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// Atualiza `alertsLastSeenAt` do usuário logado para o momento atual.
// Chamado automaticamente quando o usuário acessa a tela de alertas.
export async function markAlertsSeen(): Promise<void> {
  const session = await getSession();
  if (!session) return;

  await db.user.update({
    where: { id: session.id },
    data: { alertsLastSeenAt: new Date() },
  });
}
