"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { saveCount, closeInventory } from "../actions";
import type { OpenInventory } from "../queries";

type Props = {
  inventory: NonNullable<OpenInventory>;
};

function positionLabel(
  pos: NonNullable<OpenInventory>["items"][number]["position"],
): string {
  if (!pos) return "—";
  return `${pos.aisle.area.code} / ${pos.aisle.code} / ${pos.code}`;
}

export function CountingSheet({ inventory }: Props) {
  const [isPending, startTransition] = useTransition();
  // Valor digitado por item (string para permitir campo vazio).
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      inventory.items.map((it) => [
        it.id,
        it.countedQty === null ? "" : String(it.countedQty),
      ]),
    ),
  );

  function persist(itemId: string, raw: string) {
    if (raw === "") return; // vazio = ainda não contado
    const countedQty = Number(raw);
    if (!Number.isInteger(countedQty) || countedQty < 0) {
      toast.error("Quantidade inválida");
      return;
    }
    startTransition(async () => {
      const result = await saveCount({ itemId, countedQty });
      if (!result.ok) {
        toast.error(result.errors._?.[0] ?? "Não foi possível salvar a contagem");
      }
    });
  }

  function close() {
    if (
      !confirm(
        "Encerrar o inventário? O saldo das posições contadas será ajustado para a quantidade contada.",
      )
    )
      return;
    startTransition(async () => {
      const result = await closeInventory({ inventoryId: inventory.id });
      if (result.ok) toast.success("Inventário encerrado e saldos ajustados");
      else toast.error(result.errors._?.[0] ?? "Não foi possível encerrar");
    });
  }

  const countedCount = inventory.items.filter(
    (it) => it.countedQty !== null,
  ).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          Contagem em andamento
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {countedCount}/{inventory.items.length} contados
          </span>
        </CardTitle>
        <Button onClick={close} disabled={isPending}>
          <CheckCircle2 className="size-4" />
          Encerrar e ajustar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border" data-pending={isPending ? "" : undefined}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Posição</TableHead>
                <TableHead className="text-right">Saldo sistema</TableHead>
                <TableHead className="w-32 text-right">Contado</TableHead>
                <TableHead className="text-right">Diferença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.items.map((it) => {
                const raw = drafts[it.id] ?? "";
                const counted = raw === "" ? null : Number(raw);
                const diff = counted === null ? null : counted - it.systemQty;
                const divergent = diff !== null && diff !== 0;
                return (
                  <TableRow
                    key={it.id}
                    className={divergent ? "bg-destructive/5" : undefined}
                  >
                    <TableCell className="font-medium">
                      {it.product.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {positionLabel(it.position)}
                    </TableCell>
                    <TableCell className="text-right">{it.systemQty}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        className="h-8 text-right"
                        value={raw}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [it.id]: e.target.value }))
                        }
                        onBlur={(e) => persist(it.id, e.target.value)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {diff === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : divergent ? (
                        <Badge variant="destructive">
                          {diff > 0 ? `+${diff}` : diff}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">0</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
