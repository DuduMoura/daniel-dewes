"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ProductRow = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  minStock: number;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  totalQuantity: number;
};

type Props = {
  products: ProductRow[];
  onEdit: (product: ProductRow) => void;
  onDelete: (product: ProductRow) => void;
};

export function ProductsTable({ products, onEdit, onDelete }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-md border py-12 text-center text-sm text-muted-foreground">
        Nenhum produto encontrado.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Estoque mín.</TableHead>
            <TableHead className="text-right">Saldo atual</TableHead>
            <TableHead className="w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs">{p.sku}</TableCell>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>
                {p.category ? (
                  <Badge variant="secondary">{p.category.name}</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">{p.minStock}</TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    p.totalQuantity < p.minStock ? "font-semibold text-destructive" : ""
                  }
                >
                  {p.totalQuantity}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(p)}
                    aria-label={`Editar ${p.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(p)}
                    aria-label={`Remover ${p.name}`}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
