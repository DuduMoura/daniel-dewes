import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProduct } from "@/modules/products/queries";
import { listMovementsByProduct } from "@/modules/movements/queries";
import { MovementsTable } from "@/modules/movements/components/movements-table";

// Consulta sempre reflete o saldo/histórico atuais.
export const dynamic = "force-dynamic";

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, movements] = await Promise.all([
    getProduct(id),
    listMovementsByProduct(id),
  ]);

  if (!product) notFound();

  const total = product.stockItems.reduce((sum, s) => sum + s.quantity, 0);
  const belowMin = total < product.minStock;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/produtos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para Produtos
        </Link>
      </div>

      {/* Visão geral do produto */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl">{product.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-mono text-xs">{product.sku}</span>
                {product.category && (
                  <Badge variant="secondary">{product.category.name}</Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Saldo atual</div>
              <div
                className={
                  belowMin
                    ? "text-2xl font-semibold text-destructive"
                    : "text-2xl font-semibold"
                }
              >
                {total}
              </div>
              <div className="text-xs text-muted-foreground">
                mínimo: {product.minStock}
              </div>
            </div>
          </div>
        </CardHeader>
        {product.description && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribuição por posição */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Onde está guardado</CardTitle>
          </CardHeader>
          <CardContent>
            {product.stockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem estoque em nenhuma posição.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posição</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.stockItems.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs">
                            <MapPin className="size-3 text-muted-foreground" />
                            {s.position.aisle.area.code} / {s.position.aisle.code} /{" "}
                            {s.position.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{s.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fornecedores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            {product.suppliers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum fornecedor associado.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {product.suppliers.map((s) => (
                  <Badge key={s.id} variant="secondary">
                    {s.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico de movimentações do produto */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Histórico de movimentações
        </h2>
        <MovementsTable movements={movements} />
      </div>
    </div>
  );
}
