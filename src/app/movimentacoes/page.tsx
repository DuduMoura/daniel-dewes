import { listProducts } from "@/modules/products/queries";
import { listSuppliers } from "@/modules/suppliers/queries";
import {
  listMovements,
  listPositionOptions,
  listStockWithBalance,
} from "@/modules/movements/queries";
import { MovementForm } from "@/modules/movements/components/movement-form";
import { MovementsTable } from "@/modules/movements/components/movements-table";

// Reflete o estado atual a cada acesso (saldo e histórico em tempo real).
export const dynamic = "force-dynamic";

export default async function MovimentacoesPage() {
  const [products, suppliers, positions, stock, movements] = await Promise.all([
    listProducts(),
    listSuppliers(),
    listPositionOptions(),
    listStockWithBalance(),
    listMovements(),
  ]);

  const canMovimentar = products.length > 0 && positions.length > 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Movimentações</h1>
        <p className="text-sm text-muted-foreground">
          Entrada, saída, devolução e transferência de produtos.
        </p>
      </header>

      {canMovimentar ? (
        <MovementForm
          products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku }))}
          positions={positions}
          suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))}
          stock={stock}
        />
      ) : (
        <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
          Para registrar movimentações, cadastre ao menos um{" "}
          <strong>produto</strong> e uma <strong>posição</strong> (em
          Localização).
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Histórico</h2>
        <MovementsTable movements={movements} />
      </div>
    </div>
  );
}
