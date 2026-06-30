"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SuppliersTable, type SupplierRow } from "./suppliers-table";
import { SupplierFormDialog } from "./supplier-form-dialog";
import { deleteSupplier } from "../actions";

type Product = { id: string; name: string };

type Props = {
  suppliers: SupplierRow[];
  products: Product[];
  filters: { search: string };
};

export function SuppliersManager({ suppliers, products, filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRow | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState(filters.search);

  // Atualiza a URL preservando os demais parâmetros (filtro server-side).
  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/fornecedores?${params.toString()}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam("q", searchTerm.trim());
  }

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(supplier: SupplierRow) {
    setEditing(supplier);
    setDialogOpen(true);
  }

  function handleDelete(supplier: SupplierRow) {
    if (!confirm(`Remover o fornecedor "${supplier.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteSupplier(supplier.id);
      if (result.ok) toast.success("Fornecedor removido");
      else toast.error("Não foi possível remover o fornecedor");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={submitSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-64 pl-8"
            />
          </div>
        </form>

        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Novo fornecedor
        </Button>
      </div>

      <div data-pending={isPending ? "" : undefined}>
        <SuppliersTable
          suppliers={suppliers}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>

      <SupplierFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        products={products}
        supplier={editing}
      />
    </div>
  );
}
