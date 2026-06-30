"use client";

import { useEffect, useTransition } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { supplierSchema, type SupplierInput } from "../schema";
import { createSupplier, updateSupplier } from "../actions";

type Product = { id: string; name: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  // Quando presente, o diálogo está em modo edição.
  supplier?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    contact: string | null;
    products: { id: string }[];
  };
};

// Tipo de ENTRADA do formulário (antes da coerção do Zod).
type SupplierFormInput = z.input<typeof supplierSchema>;

const EMPTY: SupplierFormInput = {
  name: "",
  email: "",
  phone: "",
  contact: "",
  productIds: [],
};

export function SupplierFormDialog({
  open,
  onOpenChange,
  products,
  supplier,
}: Props) {
  const isEdit = Boolean(supplier);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<SupplierFormInput, unknown, SupplierInput>({
    resolver: zodResolver(supplierSchema),
    defaultValues: EMPTY,
  });

  // Sincroniza os valores do formulário ao abrir/trocar de fornecedor.
  useEffect(() => {
    if (!open) return;
    reset(
      supplier
        ? {
            name: supplier.name,
            email: supplier.email ?? "",
            phone: supplier.phone ?? "",
            contact: supplier.contact ?? "",
            productIds: supplier.products.map((p) => p.id),
          }
        : EMPTY,
    );
  }, [open, supplier, reset]);

  const productIds = useWatch({ control, name: "productIds" }) ?? [];

  function toggleProduct(id: string, checked: boolean) {
    const next = checked
      ? [...productIds, id]
      : productIds.filter((pid) => pid !== id);
    setValue("productIds", next, { shouldDirty: true });
  }

  function onSubmit(values: SupplierInput) {
    startTransition(async () => {
      const result = isEdit
        ? await updateSupplier({ ...values, id: supplier!.id })
        : await createSupplier(values);

      if (result.ok) {
        toast.success(isEdit ? "Fornecedor atualizado" : "Fornecedor cadastrado");
        onOpenChange(false);
        return;
      }

      // Mapeia erros do servidor para os campos do formulário.
      for (const [field, messages] of Object.entries(result.errors)) {
        if (messages?.length) {
          setError(field as keyof SupplierFormInput, { message: messages[0] });
        }
      }
      toast.error("Verifique os campos do formulário");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar fornecedor" : "Novo fornecedor"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact">Contato</Label>
            <Input id="contact" {...register("contact")} />
            {errors.contact && (
              <p className="text-sm text-destructive">{errors.contact.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Produtos fornecidos</Label>
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum produto cadastrado.
              </p>
            ) : (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                {products.map((p) => {
                  const checked = productIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => toggleProduct(p.id, v === true)}
                      />
                      <span>{p.name}</span>
                    </label>
                  );
                })}
              </div>
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
