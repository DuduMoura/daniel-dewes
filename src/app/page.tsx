import {
  Package,
  Truck,
  Boxes,
  TriangleAlert,
  ClipboardCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSummary } from "@/modules/dashboard/queries";

// Dashboard sempre reflete o estado atual do banco (estoque em tempo real).
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  const cards = [
    { label: "Produtos cadastrados", value: summary.products, icon: Package },
    { label: "Unidades em estoque", value: summary.totalUnits, icon: Boxes },
    { label: "Fornecedores", value: summary.suppliers, icon: Truck },
    {
      label: "Alertas em aberto",
      value: summary.openAlerts,
      icon: TriangleAlert,
      highlight: summary.openAlerts > 0,
    },
    {
      label: "Inventários abertos",
      value: summary.openInventories,
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do armazém em tempo real.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, highlight }) => (
          <Card key={label} className={highlight ? "border-destructive/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon
                className={
                  highlight
                    ? "size-4 text-destructive"
                    : "size-4 text-muted-foreground"
                }
              />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
