import { listProducts } from "@/modules/products/queries";
import { listOrders } from "@/modules/orders/queries";
import { OrdersTable } from "@/modules/orders/components/orders-table";
import { OrderCreateForm } from "@/modules/orders/components/order-create-form";

// Reflete o estado atual a cada acesso.
export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const [orders, products] = await Promise.all([listOrders(), listProducts()]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Separação e expedição de pedidos de saída.
        </p>
      </header>

      {products.length === 0 ? (
        <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
          Cadastre ao menos um <strong>produto</strong> para montar pedidos.
        </div>
      ) : (
        <OrderCreateForm
          products={products.map((p) => ({ id: p.id, name: p.name }))}
        />
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">Pedidos</h2>
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
