import { listSuppliers } from "@/modules/suppliers/queries";
import { listProducts } from "@/modules/products/queries";
import { SuppliersManager } from "@/modules/suppliers/components/suppliers-manager";

// Reflete o estado atual a cada acesso (lista em tempo real).
export const dynamic = "force-dynamic";

export default async function FornecedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  const [suppliers, products] = await Promise.all([
    listSuppliers({ search: q || undefined }),
    listProducts(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Fornecedores</h1>
        <p className="text-sm text-muted-foreground">
          Cadastro de fornecedores e produtos fornecidos.
        </p>
      </header>

      <SuppliersManager
        suppliers={suppliers}
        products={products}
        filters={{ search: q }}
      />
    </div>
  );
}
