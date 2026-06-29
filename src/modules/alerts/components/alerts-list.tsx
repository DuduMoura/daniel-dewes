"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { markAlertsSeen } from "../actions";
import type { OpenAlert } from "../queries";

type Props = {
  alerts: OpenAlert[];
};

export function AlertsList({ alerts }: Props) {
  // Marca alertas como vistos ao renderizar a lista (notificação "lida")
  useEffect(() => {
    markAlertsSeen();
  }, []);

  if (alerts.length === 0) {
    return (
      <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
        Nenhum alerta em aberto. Todos os produtos estão no nível mínimo ou
        acima.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead className="text-right">Saldo atual</TableHead>
            <TableHead className="text-right">Mínimo</TableHead>
            <TableHead>Fornecedores</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <TriangleAlert className="size-4 text-destructive" />
                  <span className="font-medium">{alert.product.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {alert.product.sku}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold text-destructive">
                {alert.currentQty}
              </TableCell>
              <TableCell className="text-right">{alert.minStock}</TableCell>
              <TableCell>
                {alert.product.suppliers.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Sem fornecedor cadastrado
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {alert.product.suppliers.map((s) => (
                      <Badge key={s.id} variant="secondary">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
