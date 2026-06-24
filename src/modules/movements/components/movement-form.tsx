"use client";

import { useEffect, useMemo, useTransition } from "react";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpFromLine, Undo2, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { movementSchema, type MovementInput } from "../schema";
import { registerMovement } from "../actions";
import { suggestPutAwayPosition } from "../put-away";
import type { PositionOption, StockEntry } from "../queries";

type Product = { id: string; name: string; sku: string };
type Supplier = { id: string; name: string };

type Props = {
  products: Product[];
  positions: PositionOption[];
  suppliers: Supplier[];
  stock: StockEntry[];
};

type MovementFormInput = z.input<typeof movementSchema>;

const EMPTY: MovementFormInput = {
  type: "ENTRADA",
  productId: "",
  quantity: 1,
  fromPositionId: "",
  toPositionId: "",
  supplierId: "",
  direction: undefined,
  note: "",
};

const TYPE_LABELS: Record<string, { label: string; icon: typeof ArrowDownToLine }> = {
  ENTRADA: { label: "Entrada", icon: ArrowDownToLine },
  SAIDA: { label: "Saída", icon: ArrowUpFromLine },
  DEVOLUCAO: { label: "Devolução", icon: Undo2 },
  TRANSFERENCIA: { label: "Transferência", icon: ArrowLeftRight },
};

export function MovementForm({ products, positions, suppliers, stock }: Props) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<MovementFormInput, unknown, MovementInput>({
    resolver: zodResolver(movementSchema),
    defaultValues: EMPTY,
  });

  const [type, direction, productId, fromPositionId, toPositionId, supplierId] = useWatch({
    control,
    name: [
      "type",
      "direction",
      "productId",
      "fromPositionId",
      "toPositionId",
      "supplierId",
    ],
  });

  // Quais campos cada tipo exige.
  const needsTo =
    type === "ENTRADA" ||
    type === "TRANSFERENCIA" ||
    (type === "DEVOLUCAO" && direction === "CLIENTE");
  const needsFrom =
    type === "SAIDA" ||
    type === "TRANSFERENCIA" ||
    (type === "DEVOLUCAO" && direction === "FORNECEDOR");
  const needsDirection = type === "DEVOLUCAO";
  const supplierRelevant = type === "ENTRADA" || type === "DEVOLUCAO";

  // Origem: só posições onde o produto tem saldo > 0, com a quantidade.
  const originOptions = useMemo(() => {
    if (!productId) return [];
    const byPosition = new Map(
      stock
        .filter((s) => s.productId === productId)
        .map((s) => [s.positionId, s.quantity]),
    );
    return positions
      .filter((p) => byPosition.has(p.id))
      .map((p) => ({ ...p, available: byPosition.get(p.id)! }));
  }, [productId, positions, stock]);

  // Put-away: sugestão de posição de destino — só para entradas (ENTRADA e
  // DEVOLUÇÃO de cliente). Saídas/transferências/devolução a fornecedor não usam.
  const suggestedToId = useMemo(
    () =>
      needsTo && productId
        ? suggestPutAwayPosition(productId, positions, stock)
        : null,
    [needsTo, productId, positions, stock],
  );

  // Saldo do produto por posição (para exibir na opção sugerida).
  const productBalanceByPos = useMemo(() => {
    const m = new Map<string, number>();
    for (const s of stock) if (s.productId === productId) m.set(s.positionId, s.quantity);
    return m;
  }, [productId, stock]);

  // Pré-seleciona a posição sugerida quando o destino ainda está vazio
  // (recalcula ao trocar o produto, que zera o destino).
  useEffect(() => {
    if (needsTo && suggestedToId && !toPositionId) {
      setValue("toPositionId", suggestedToId);
    }
  }, [needsTo, suggestedToId, toPositionId, setValue]);

  function onSubmit(values: MovementInput) {
    startTransition(async () => {
      const result = await registerMovement(values);
      if (result.ok) {
        toast.success("Movimentação registrada");
        // Mantém o tipo selecionado para registros em sequência.
        reset({ ...EMPTY, type: values.type });
        return;
      }
      for (const [field, messages] of Object.entries(result.errors)) {
        if (messages?.length && field !== "_") {
          setError(field as keyof MovementFormInput, { message: messages[0] });
        }
      }
      toast.error(result.errors._?.[0] ?? "Verifique os campos do formulário");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar movimentação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Tipo */}
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  setValue("type", v as MovementInput["type"]);
                  // Troca de tipo zera os campos dependentes.
                  setValue("fromPositionId", "");
                  setValue("toPositionId", "");
                  setValue("direction", undefined);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, { label, icon: Icon }]) => (
                    <SelectItem key={value} value={value}>
                      <Icon className="size-4" />
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Produto */}
            <div className="space-y-1.5">
              <Label>Produto</Label>
              <Select
                value={productId}
                onValueChange={(v) => {
                  setValue("productId", v);
                  setValue("fromPositionId", ""); // origem depende do produto
                  setValue("toPositionId", ""); // re-pré-seleciona a sugestão de put-away
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && (
                <p className="text-sm text-destructive">{errors.productId.message}</p>
              )}
            </div>

            {/* Direção da devolução */}
            {needsDirection && (
              <div className="space-y-1.5">
                <Label>Direção</Label>
                <Select
                  value={direction ?? ""}
                  onValueChange={(v) => {
                    setValue("direction", v as MovementInput["direction"]);
                    setValue("fromPositionId", "");
                    setValue("toPositionId", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a direção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENTE">De cliente (entrada)</SelectItem>
                    <SelectItem value="FORNECEDOR">A fornecedor (saída)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.direction && (
                  <p className="text-sm text-destructive">{errors.direction.message}</p>
                )}
              </div>
            )}

            {/* Quantidade */}
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                {...register("quantity")}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

            {/* Origem */}
            {needsFrom && (
              <div className="space-y-1.5">
                <Label>Origem</Label>
                <Select
                  value={fromPositionId ?? ""}
                  onValueChange={(v) => setValue("fromPositionId", v)}
                  disabled={!productId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        productId ? "Posição de origem" : "Selecione o produto antes"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {originOptions.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        Sem saldo para este produto
                      </SelectItem>
                    ) : (
                      originOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.label} (saldo: {p.available})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.fromPositionId && (
                  <p className="text-sm text-destructive">
                    {errors.fromPositionId.message}
                  </p>
                )}
              </div>
            )}

            {/* Destino */}
            {needsTo && (
              <div className="space-y-1.5">
                <Label>Destino</Label>
                <Select
                  value={toPositionId ?? ""}
                  onValueChange={(v) => setValue("toPositionId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Posição de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((p) => {
                      const isSuggested = p.id === suggestedToId;
                      const bal = productBalanceByPos.get(p.id);
                      return (
                        <SelectItem key={p.id} value={p.id}>
                          {p.label}
                          {isSuggested
                            ? ` · Sugerida${bal ? ` (saldo: ${bal})` : ""}`
                            : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {suggestedToId && (
                  <p className="text-xs text-muted-foreground">
                    Posição sugerida pré-selecionada — você pode trocar.
                  </p>
                )}
                {errors.toPositionId && (
                  <p className="text-sm text-destructive">
                    {errors.toPositionId.message}
                  </p>
                )}
              </div>
            )}

            {/* Fornecedor (opcional) */}
            {supplierRelevant && (
              <div className="space-y-1.5">
                <Label>Fornecedor (opcional)</Label>
                <Select
                  value={supplierId || "__none__"}
                  onValueChange={(v) =>
                    setValue("supplierId", v === "__none__" ? "" : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sem fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sem fornecedor</SelectItem>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Observação */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="note">Observação (opcional)</Label>
              <Input id="note" {...register("note")} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              Registrar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
