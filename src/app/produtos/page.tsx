import { listProducts } from "@/modules/products/queries";
import { listCategories } from "@/modules/categories/queries";
import { ProductsManager } from "@/modules/products/components/products-manager";

// Reflete o estado atual a cada acesso (lista/saldo em tempo real).
export const dynamic = "force-dynamic";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string }>;
}) {
  const { q = "", categoria = "" } = await searchParams;

  const [products, categories] = await Promise.all([
    listProducts({ search: q || undefined, categoryId: categoria || undefined }),
    listCategories(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
        <p className="text-sm text-muted-foreground">
          Cadastro de produtos, categorias e estoque mínimo.
        </p>
      </header>

      <ProductsManager
        products={products}
        categories={categories}
        filters={{ search: q, categoryId: categoria }}
      />
    </div>
  );
}
