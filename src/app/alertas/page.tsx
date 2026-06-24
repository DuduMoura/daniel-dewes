import { syncAlerts } from "@/modules/alerts/service";
import { listOpenAlerts } from "@/modules/alerts/queries";
import { AlertsList } from "@/modules/alerts/components/alerts-list";

// Reflete o estado atual a cada acesso (alertas em tempo real).
export const dynamic = "force-dynamic";

export default async function AlertasPage() {
  // Rede de segurança: reconcilia todos os produtos antes de listar
  // (ex.: estoque mínimo alterado fora de uma movimentação).
  await syncAlerts();
  const alerts = await listOpenAlerts();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Alertas</h1>
        <p className="text-sm text-muted-foreground">
          Produtos com estoque abaixo do mínimo definido.
        </p>
      </header>

      <AlertsList alerts={alerts} />
    </div>
  );
}
