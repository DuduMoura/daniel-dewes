"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { positionSchema, type PositionInput } from "../schema";
import { createPosition, updatePosition } from "../actions";

type PositionFormInput = z.input<typeof positionSchema>;

type AreaOption = {
  id: string;
  code: string;
  name: string;
  aisles: { id: string; code: string }[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areas: AreaOption[];
  // Área/corredor pré-selecionados ao criar (contexto da árvore).
  defaultAreaId?: string;
  defaultAisleId?: string;
  // Quando presente, o diálogo está em modo edição.
  position?: { id: string; code: string; aisleId: string; areaId: string };
};

export function PositionFormDialog({
  open,
  onOpenChange,
  areas,
  defaultAreaId,
  defaultAisleId,
  position,
}: Props) {
  const isEdit = Boolean(position);
  const [isPending, startTransition] = useTransition();
  // Área é só um filtro de UI; o valor gravado é o aisleId.
  const [selectedAreaId, setSelectedAreaId] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<PositionFormInput, unknown, PositionInput>({
    resolver: zodResolver(positionSchema),
    defaultValues: { code: "", aisleId: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (position) {
      setSelectedAreaId(position.areaId);
      reset({ code: position.code, aisleId: position.aisleId });
    } else {
      setSelectedAreaId(defaultAreaId ?? "");
      reset({ code: "", aisleId: defaultAisleId ?? "" });
    }
  }, [open, position, defaultAreaId, defaultAisleId, reset]);

  const aisleId = watch("aisleId");

  const aislesOfArea = useMemo(
    () => areas.find((a) => a.id === selectedAreaId)?.aisles ?? [],
    [areas, selectedAreaId],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar posição" : "Nova posição"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => {
            startTransition(async () => {
              const result = isEdit
                ? await updatePosition({ ...values, id: position!.id })
                : await createPosition(values);
              if (result.ok) {
                toast.success(isEdit ? "Posição atualizada" : "Posição cadastrada");
                onOpenChange(false);
                return;
              }
              for (const [field, messages] of Object.entries(result.errors)) {
                if (messages?.length && field !== "_") {
                  setError(field as keyof PositionFormInput, {
                    message: messages[0],
                  });
                }
              }
              toast.error(
                result.errors._?.[0] ?? "Verifique os campos do formulário",
              );
            });
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Área</Label>
            <Select
              value={selectedAreaId}
              onValueChange={(v) => {
                setSelectedAreaId(v);
                setValue("aisleId", ""); // troca de área zera o corredor
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.code} — {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Corredor</Label>
            <Select
              value={aisleId}
              onValueChange={(v) => setValue("aisleId", v)}
              disabled={!selectedAreaId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedAreaId ? "Selecione o corredor" : "Selecione a área antes"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {aislesOfArea.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.aisleId && (
              <p className="text-sm text-destructive">{errors.aisleId.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="position-code">Código</Label>
            <Input id="position-code" {...register("code")} />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Salvar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
