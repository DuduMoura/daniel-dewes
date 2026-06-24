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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productSchema, type ProductInput } from "../schema";
import { createProduct, updateProduct } from "../actions";

type Category = { id: string; name: string };

export type ProductFormValues = ProductInput & { id?: string };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  // Quando presente, o diálogo está em modo edição.
  product?: {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    minStock: number;
    categoryId: string | null;
  };
};

// Tipo de ENTRADA do formulário (antes da coerção do Zod).
type ProductFormInput = z.input<typeof productSchema>;

const EMPTY: ProductFormInput = {
  sku: "",
  name: "",
  description: "",
  minStock: 0,
  categoryId: "",
};

const NONE = "__none__"; // valor sentinela para "sem categoria" no Select

export function ProductFormDialog({
  open,
  onOpenChange,
  categories,
  product,
}: Props) {
  const isEdit = Boolean(product);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<ProductFormInput, unknown, ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: EMPTY,
  });

  // Sincroniza os valores do formulário ao abrir/trocar de produto.
  useEffect(() => {
    if (!open) return;
    reset(
      product
        ? {
            sku: product.sku,
            name: product.name,
            description: product.description ?? "",
            minStock: product.minStock,
            categoryId: product.categoryId ?? "",
          }
        : EMPTY,
    );
  }, [open, product, reset]);

  const categoryId = useWatch({ control, name: "categoryId" }) ?? "";

  function onSubmit(values: ProductInput) {
    startTransition(async () => {
      const result = isEdit
        ? await updateProduct({ ...values, id: product!.id })
        : await createProduct(values);

      if (result.ok) {
        toast.success(isEdit ? "Produto atualizado" : "Produto cadastrado");
        onOpenChange(false);
        return;
      }

      // Mapeia erros do servidor para os campos do formulário.
      for (const [field, messages] of Object.entries(result.errors)) {
        if (messages?.length) {
          setError(field as keyof ProductFormInput, { message: messages[0] });
        }
      }
      toast.error("Verifique os campos do formulário");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar produto" : "Novo produto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} />
              {errors.sku && (
                <p className="text-sm text-destructive">{errors.sku.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minStock">Estoque mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min={0}
                {...register("minStock", { valueAsNumber: true })}
              />
              {errors.minStock && (
                <p className="text-sm text-destructive">
                  {errors.minStock.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Select
              value={categoryId ? categoryId : NONE}
              onValueChange={(v) =>
                setValue("categoryId", v === NONE ? "" : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sem categoria</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
