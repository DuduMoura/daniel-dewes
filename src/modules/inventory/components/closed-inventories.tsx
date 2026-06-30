import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ClosedInventory } from "../queries";

type Props = {
  inventories: ClosedInventory[];
};

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function ClosedInventories({ inventories }: Props) {
  if (inventories.length === 0) {
    return (
      <div className="rounded-md border py-8 text-center text-sm text-muted-foreground">
        Nenhum inventário encerrado ainda.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Encerrado em</TableHead>
            <TableHead className="text-right">Itens</TableHead>
            <TableHead className="text-right">Divergências</TableHead>
            <TableHead>Observação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventories.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell>
                {inv.closedAt ? dateFmt.format(inv.closedAt) : "—"}
              </TableCell>
              <TableCell className="text-right">{inv._count.items}</TableCell>
              <TableCell className="text-right">
                {inv.divergences > 0 ? (
                  <Badge variant="destructive">{inv.divergences}</Badge>
                ) : (
                  <Badge variant="secondary">0</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {inv.note ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
