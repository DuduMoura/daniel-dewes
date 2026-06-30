"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, FolderPlus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductsTable, type ProductRow } from "./products-table";
import { ProductFormDialog } from "./product-form-dialog";
import { CategoryFormDialog } from "@/modules/categories/components/category-form-dialog";
import { deleteProduct } from "../actions";

type Category = { id: string; name: string };

type Props = {
  products: ProductRow[];
  categories: Category[];
  filters: { search: string; categoryId: string };
};

const ALL = "__all__"; // sentinela para "todas as categorias" no filtro

export function ProductsManager({ products, categories, filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductRow | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState(filters.search);

  // Atualiza a URL preservando os demais parâmetros (filtro server-side).
  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/produtos?${params.toString()}`);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam("q", searchTerm.trim());
  }

  function openCreate() {
    setEditing(undefined);
    setProductDialogOpen(true);
  }

  function openEdit(product: ProductRow) {
    setEditing(product);
    setProductDialogOpen(true);
  }

  function handleDelete(product: ProductRow) {
    if (!confirm(`Remover o produto "${product.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (result.ok) toast.success("Produto removido");
      else toast.error("Não foi possível remover o produto");
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
          <Select
            value={filters.categoryId ? filters.categoryId : ALL}
            onValueChange={(v) => setParam("categoria", v === ALL ? "" : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
            <FolderPlus className="size-4" />
            Nova categoria
          </Button>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Novo produto
          </Button>
        </div>
      </div>

      <div data-pending={isPending ? "" : undefined}>
        <ProductsTable
          products={products}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>

      <ProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        categories={categories}
        product={editing}
      />
      <CategoryFormDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
      />
    </div>
  );
}
