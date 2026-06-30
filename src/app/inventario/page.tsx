import { listAreas } from "@/modules/locations/queries";
import {
  getOpenInventory,
  listClosedInventories,
} from "@/modules/inventory/queries";
import { InventoryStartForm } from "@/modules/inventory/components/inventory-start-form";
import { CountingSheet } from "@/modules/inventory/components/counting-sheet";
import { ClosedInventories } from "@/modules/inventory/components/closed-inventories";

// Reflete o estado atual a cada acesso (inventário/saldo em tempo real).
export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const open = await getOpenInventory();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Inventário</h1>
        <p className="text-sm text-muted-foreground">
          Contagem física e conferência com o saldo do sistema.
        </p>
      </header>

      {open ? (
        // Há um inventário aberto: mostra a planilha de contagem.
        <CountingSheet inventory={open} />
      ) : (
        // Sem inventário aberto: formulário de abertura + histórico.
        <InventoryAvailable />
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Histórico de inventários
        </h2>
        <ClosedInventories inventories={await listClosedInventories()} />
      </div>
    </div>
  );
}

// Carrega áreas para o formulário de abertura (escopo opcional).
async function InventoryAvailable() {
  const areas = await listAreas();
  return (
    <InventoryStartForm
      areas={areas.map((a) => ({ id: a.id, code: a.code, name: a.name }))}
    />
  );
}
