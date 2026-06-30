"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createOrder } from "../actions";

type Product = { id: string; name: string };
type ItemRow = { productId: string; quantity: string };

type Props = {
  products: Product[];
};

export function OrderCreateForm({ products }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [rows, setRows] = useState<ItemRow[]>([{ productId: "", quantity: "1" }]);

  function updateRow(i: number, patch: Partial<ItemRow>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function addRow() {
    setRows((r) => [...r, { productId: "", quantity: "1" }]);
  }
  function removeRow(i: number) {
    setRows((r) => (r.length === 1 ? r : r.filter((_, idx) => idx !== i)));
  }

  function submit() {
    const items = rows
      .filter((r) => r.productId)
      .map((r) => ({ productId: r.productId, quantity: Number(r.quantity) }));
    if (items.length === 0) {
      toast.error("Adicione ao menos um item com produto");
      return;
    }
    startTransition(async () => {
      const result = await createOrder({ note, items });
      if (result.ok) {
        toast.success("Pedido criado");
        if (result.id) router.push(`/pedidos/${result.id}`);
        return;
      }
      toast.error(result.errors._?.[0] ?? "Não foi possível criar o pedido");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Itens</Label>
          {rows.map((row, i) => (
            <div key={i} className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  value={row.productId}
                  onValueChange={(v) => updateRow(i, { productId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min={1}
                className="w-24"
                value={row.quantity}
                onChange={(e) => updateRow(i, { quantity: e.target.value })}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeRow(i)}
                aria-label="Remover item"
                disabled={rows.length === 1}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="size-4" />
            Adicionar item
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="order-note">Observação (opcional)</Label>
          <Input
            id="order-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={submit} disabled={isPending}>
            Criar pedido
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
