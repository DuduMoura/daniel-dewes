"use client";

import { useEffect, useTransition } from "react";
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
import { aisleSchema, type AisleInput } from "../schema";
import { createAisle, updateAisle } from "../actions";

type AisleFormInput = z.input<typeof aisleSchema>;

type AreaOption = { id: string; code: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areas: AreaOption[];
  // Área pré-selecionada ao criar (contexto da árvore).
  defaultAreaId?: string;
  // Quando presente, o diálogo está em modo edição.
  aisle?: { id: string; code: string; areaId: string };
};

export function AisleFormDialog({
  open,
  onOpenChange,
  areas,
  defaultAreaId,
  aisle,
}: Props) {
  const isEdit = Boolean(aisle);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<AisleFormInput, unknown, AisleInput>({
    resolver: zodResolver(aisleSchema),
    defaultValues: { code: "", areaId: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      aisle
        ? { code: aisle.code, areaId: aisle.areaId }
        : { code: "", areaId: defaultAreaId ?? "" },
    );
  }, [open, aisle, defaultAreaId, reset]);

  const areaId = watch("areaId");

  function onSubmit(values: AisleInput) {
    startTransition(async () => {
      const result = isEdit
        ? await updateAisle({ ...values, id: aisle!.id })
        : await createAisle(values);
      if (result.ok) {
        toast.success(isEdit ? "Corredor atualizado" : "Corredor cadastrado");
        onOpenChange(false);
        return;
      }
      for (const [field, messages] of Object.entries(result.errors)) {
        if (messages?.length && field !== "_") {
          setError(field as keyof AisleFormInput, { message: messages[0] });
        }
      }
      toast.error(result.errors._?.[0] ?? "Verifique os campos do formulário");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar corredor" : "Novo corredor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Área</Label>
            <Select value={areaId} onValueChange={(v) => setValue("areaId", v)}>
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
            {errors.areaId && (
              <p className="text-sm text-destructive">{errors.areaId.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="aisle-code">Código</Label>
            <Input id="aisle-code" {...register("code")} />
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
