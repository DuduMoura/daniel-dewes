import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrder } from "@/modules/orders/queries";
import {
  listPositionOptions,
  listStockWithBalance,
} from "@/modules/movements/queries";
import { OrderPicking } from "@/modules/orders/components/order-picking";

// Reflete o saldo/estado atuais a cada acesso.
export const dynamic = "force-dynamic";

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order, positions, stock] = await Promise.all([
    getOrder(id),
    listPositionOptions(),
    listStockWithBalance(),
  ]);

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para Pedidos
        </Link>
      </div>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Pedido{" "}
          <span className="font-mono text-lg text-muted-foreground">
            {order.id.slice(-8)}
          </span>
        </h1>
      </header>

      <OrderPicking order={order} positions={positions} stock={stock} />
    </div>
  );
}
