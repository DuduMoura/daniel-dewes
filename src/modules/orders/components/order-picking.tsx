"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, Check, PackageCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pickItem, shipOrder, cancelOrder } from "../actions";
import type { OrderDetail } from "../queries";
import type { PositionOption, StockEntry } from "@/modules/movements/queries";

type Props = {
  order: NonNullable<OrderDetail>;
  positions: PositionOption[];
  stock: StockEntry[];
};

const STATUS_LABEL: Record<string, string> = {
  ABERTO: "Aberto",
  EXPEDIDO: "Expedido",
  CANCELADO: "Cancelado",
};

export function OrderPicking({ order, positions, stock }: Props) {
  const [isPending, startTransition] = useTransition();
  const [picks, setPicks] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      order.items.map((it) => [it.id, it.pickedFromPositionId ?? ""]),
    ),
  );

  const isOpen = order.status === "ABERTO";
  const allPicked = order.items.every((it) => it.picked);

  // Posições com saldo > 0 por produto (para o seletor de coleta).
  const optionsByProduct = useMemo(() => {
    const map = new Map<string, { id: string; label: string; available: number }[]>();
    for (const it of order.items) {
      if (map.has(it.productId)) continue;
      const byPos = new Map(
        stock
          .filter((s) => s.productId === it.productId)
          .map((s) => [s.positionId, s.quantity]),
      );
      map.set(
        it.productId,
        positions
          .filter((p) => byPos.has(p.id))
          .map((p) => ({ ...p, available: byPos.get(p.id)! })),
      );
    }
    return map;
  }, [order.items, positions, stock]);

  function confirmPick(itemId: string) {
    const positionId = picks[itemId];
    if (!positionId) {
      toast.error("Selecione a posição de coleta");
      return;
    }
    startTransition(async () => {
      const result = await pickItem({ itemId, positionId });
      if (result.ok) toast.success("Coleta confirmada");
      else toast.error(result.errors._?.[0] ?? "Não foi possível confirmar a coleta");
    });
  }

  function ship() {
    if (!confirm("Expedir o pedido? O estoque das posições coletadas será baixado."))
      return;
    startTransition(async () => {
      const result = await shipOrder({ orderId: order.id });
      if (result.ok) toast.success("Pedido expedido");
      else toast.error(result.errors._?.[0] ?? "Não foi possível expedir");
    });
  }

  function cancel() {
    if (!confirm("Cancelar o pedido?")) return;
    startTransition(async () => {
      const result = await cancelOrder({ orderId: order.id });
      if (result.ok) toast.success("Pedido cancelado");
      else toast.error(result.errors._?.[0] ?? "Não foi possível cancelar");
    });
  }

  return (
    <Card data-pending={isPending ? "" : undefined}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          Separação
          <Badge variant={isOpen ? "secondary" : "default"}>
            {STATUS_LABEL[order.status]}
          </Badge>
        </CardTitle>
        {isOpen && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={cancel} disabled={isPending}>
              <XCircle className="size-4" />
              Cancelar
            </Button>
            <Button onClick={ship} disabled={isPending || !allPicked}>
              <PackageCheck className="size-4" />
              Expedir
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {order.items.map((it) => {
          const opts = optionsByProduct.get(it.productId) ?? [];
          const pickedLabel = it.pickedFrom
            ? `${it.pickedFrom.aisle.area.code} / ${it.pickedFrom.aisle.code} / ${it.pickedFrom.code}`
            : null;
          return (
            <div
              key={it.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
            >
              <div className="min-w-40">
                <div className="font-medium">{it.product.name}</div>
                <div className="text-xs text-muted-foreground">
                  Quantidade: {it.quantity}
                </div>
              </div>

              {it.picked ? (
                <Badge variant="default" className="gap-1">
                  <Check className="size-3" />
                  Coletado em {pickedLabel}
                </Badge>
              ) : isOpen ? (
                <div className="flex items-center gap-2">
                  <Select
                    value={picks[it.id] ?? ""}
                    onValueChange={(v) =>
                      setPicks((p) => ({ ...p, [it.id]: v }))
                    }
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Posição de coleta" />
                    </SelectTrigger>
                    <SelectContent>
                      {opts.length === 0 ? (
                        <SelectItem value="__none__" disabled>
                          Sem saldo para este produto
                        </SelectItem>
                      ) : (
                        opts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.label} (saldo: {p.available})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => confirmPick(it.id)}
                    disabled={isPending}
                  >
                    <CheckCircle2 className="size-4" />
                    Confirmar
                  </Button>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {pickedLabel ?? "—"}
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
