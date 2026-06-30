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
import { areaSchema, type AreaInput } from "../schema";
import { createArea, updateArea } from "../actions";

type AreaFormInput = z.input<typeof areaSchema>;

const EMPTY: AreaFormInput = { code: "", name: "" };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Quando presente, o diálogo está em modo edição.
  area?: { id: string; code: string; name: string };
};

export function AreaFormDialog({ open, onOpenChange, area }: Props) {
  const isEdit = Boolean(area);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AreaFormInput, unknown, AreaInput>({
    resolver: zodResolver(areaSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(area ? { code: area.code, name: area.name } : EMPTY);
  }, [open, area, reset]);

  function onSubmit(values: AreaInput) {
    startTransition(async () => {
      const result = isEdit
        ? await updateArea({ ...values, id: area!.id })
        : await createArea(values);
      if (result.ok) {
        toast.success(isEdit ? "Área atualizada" : "Área cadastrada");
        onOpenChange(false);
        return;
      }
      for (const [field, messages] of Object.entries(result.errors)) {
        if (messages?.length && field !== "_") {
          setError(field as keyof AreaFormInput, { message: messages[0] });
        }
      }
      toast.error(result.errors._?.[0] ?? "Verifique os campos do formulário");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar área" : "Nova área"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="area-code">Código</Label>
            <Input id="area-code" {...register("code")} />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="area-name">Nome</Label>
            <Input id="area-name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
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
