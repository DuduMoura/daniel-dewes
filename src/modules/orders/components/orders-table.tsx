import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OrderListItem } from "../queries";

type Props = {
  orders: OrderListItem[];
};

const STATUS: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  ABERTO: { label: "Aberto", variant: "secondary" },
  EXPEDIDO: { label: "Expedido", variant: "default" },
  CANCELADO: { label: "Cancelado", variant: "outline" },
};

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function OrdersTable({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <div className="rounded-md border py-12 text-center text-sm text-muted-foreground">
        Nenhum pedido cadastrado.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Itens</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Observação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => {
            const st = STATUS[o.status];
            return (
              <TableRow key={o.id}>
                <TableCell className="font-medium">
                  <Link
                    href={`/pedidos/${o.id}`}
                    className="font-mono text-xs hover:text-primary hover:underline"
                  >
                    {o.id.slice(-8)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </TableCell>
                <TableCell className="text-right">{o._count.items}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {dateFmt.format(o.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {o.note ?? "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
