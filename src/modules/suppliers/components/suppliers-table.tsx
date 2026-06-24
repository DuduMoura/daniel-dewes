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

export type SupplierRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  contact: string | null;
  _count: { products: number };
  products: { id: string }[];
};

type Props = {
  suppliers: SupplierRow[];
  onEdit: (supplier: SupplierRow) => void;
  onDelete: (supplier: SupplierRow) => void;
};

export function SuppliersTable({ suppliers, onEdit, onDelete }: Props) {
  if (suppliers.length === 0) {
    return (
      <div className="rounded-md border py-12 text-center text-sm text-muted-foreground">
        Nenhum fornecedor encontrado.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead className="text-right">Produtos</TableHead>
            <TableHead className="w-24 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-medium">{s.name}</TableCell>
              <TableCell>
                {s.email ?? <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                {s.phone ?? <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell>
                {s.contact ?? <span className="text-muted-foreground">—</span>}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary">{s._count.products}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(s)}
                    aria-label={`Editar ${s.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete(s)}
                    aria-label={`Remover ${s.name}`}
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
