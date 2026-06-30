import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MovementListItem } from "../queries";

type Props = {
  movements: MovementListItem[];
};

const TYPE_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  ENTRADA: { label: "Entrada", variant: "default" },
  SAIDA: { label: "Saída", variant: "destructive" },
  DEVOLUCAO: { label: "Devolução", variant: "secondary" },
  TRANSFERENCIA: { label: "Transferência", variant: "outline" },
};

function positionLabel(
  pos: MovementListItem["fromPosition"],
): string | null {
  if (!pos) return null;
  return `${pos.aisle.area.code} / ${pos.aisle.code} / ${pos.code}`;
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function MovementsTable({ movements }: Props) {
  if (movements.length === 0) {
    return (
      <div className="rounded-md border py-12 text-center text-sm text-muted-foreground">
        Nenhuma movimentação registrada.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Qtd.</TableHead>
            <TableHead>Origem → Destino</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => {
            const from = positionLabel(m.fromPosition);
            const to = positionLabel(m.toPosition);
            const badge = TYPE_BADGE[m.type];
            return (
              <TableRow key={m.id}>
                <TableCell>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </TableCell>
                <TableCell className="font-medium">{m.product.name}</TableCell>
                <TableCell className="text-right">{m.quantity}</TableCell>
                <TableCell className="text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="font-mono text-xs">{from ?? "—"}</span>
                    <ArrowRight className="size-3 text-muted-foreground" />
                    <span className="font-mono text-xs">{to ?? "—"}</span>
                  </span>
                </TableCell>
                <TableCell className="text-sm">
                  {m.supplier?.name ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {dateFmt.format(m.createdAt)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
