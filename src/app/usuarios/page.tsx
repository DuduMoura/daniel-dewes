import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { listUsers } from "@/modules/users/queries";
import { UsersManager } from "@/modules/users/components/users-manager";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await getSession();
  if (!session || session.role !== "GESTOR") redirect("/");

  const users = await listUsers();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
        <p className="text-sm text-muted-foreground">
          Gerenciamento de usuários e perfis de acesso.
        </p>
      </header>

      <UsersManager users={users} currentUserId={session.id} />
    </div>
  );
}
