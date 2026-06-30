"use client";

import { useState, useTransition } from "react";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { openInventory } from "../actions";

type Area = { id: string; code: string; name: string };

type Props = {
  areas: Area[];
};

export function InventoryStartForm({ areas }: Props) {
  const [isPending, startTransition] = useTransition();
  const [areaIds, setAreaIds] = useState<string[]>([]);
  const [note, setNote] = useState("");

  function toggleArea(id: string, checked: boolean) {
    setAreaIds((prev) =>
      checked ? [...prev, id] : prev.filter((a) => a !== id),
    );
  }

  function start() {
    startTransition(async () => {
      const result = await openInventory({ areaIds, note });
      if (result.ok) {
        toast.success("Inventário iniciado");
        setAreaIds([]);
        setNote("");
        return;
      }
      toast.error(result.errors._?.[0] ?? "Não foi possível iniciar o inventário");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Iniciar inventário</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Áreas a conferir (opcional)</Label>
          {areas.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma área cadastrada.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3 rounded-md border p-3">
              {areas.map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={areaIds.includes(a.id)}
                    onCheckedChange={(v) => toggleArea(a.id, v === true)}
                  />
                  <span>
                    {a.code} — {a.name}
                  </span>
                </label>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Sem seleção, o inventário cobre o armazém inteiro.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inv-note">Observação (opcional)</Label>
          <Input
            id="inv-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={start} disabled={isPending}>
            <ClipboardList className="size-4" />
            Iniciar inventário
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
