import { db } from "@/lib/db";

export type ListSuppliersFilters = {
  search?: string;
};

export type SupplierListItem = Awaited<
  ReturnType<typeof listSuppliers>
>[number];

// Lista fornecedores com busca por nome e a contagem de produtos fornecidos.
export async function listSuppliers(filters: ListSuppliersFilters = {}) {
  const { search } = filters;
  return db.supplier.findMany({
    where: search
      ? { name: { contains: search, mode: "insensitive" } }
      : undefined,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
      // IDs dos produtos associados — usados pelo formulário no modo edição
      // (evita uma ida extra ao servidor por linha).
      products: { select: { id: true } },
    },
  });
}

// Fornecedor com os IDs dos produtos associados (para o formulário de edição).
export async function getSupplier(id: string) {
  return db.supplier.findUnique({
    where: { id },
    include: { products: { select: { id: true } } },
  });
}
