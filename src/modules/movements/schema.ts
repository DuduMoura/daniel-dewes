import { z } from "zod";

// Fonte única de verdade do registro de movimentação de estoque.
// A forma do movimento (quais posições são exigidas) depende do `type`
// e, na DEVOLUÇÃO, da `direction`.

export const MOVEMENT_TYPES = [
  "ENTRADA",
  "SAIDA",
  "DEVOLUCAO",
  "TRANSFERENCIA",
] as const;

// Direção da devolução: de cliente (entra) ou a fornecedor (sai).
export const RETURN_DIRECTIONS = ["CLIENTE", "FORNECEDOR"] as const;

export const movementSchema = z
  .object({
    type: z.enum(MOVEMENT_TYPES),
    productId: z.string().cuid("Produto inválido"),
    quantity: z.coerce
      .number()
      .int("Quantidade deve ser inteira")
      .min(1, "Quantidade deve ser ≥ 1"),
    fromPositionId: z.string().cuid().optional().or(z.literal("")),
    toPositionId: z.string().cuid().optional().or(z.literal("")),
    supplierId: z.string().cuid().optional().or(z.literal("")),
    // Só usada quando type === DEVOLUCAO.
    direction: z.enum(RETURN_DIRECTIONS).optional(),
    note: z.string().max(500).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const hasFrom = !!data.fromPositionId;
    const hasTo = !!data.toPositionId;

    const requireTo = () => {
      if (!hasTo)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["toPositionId"],
          message: "Posição de destino é obrigatória",
        });
    };
    const requireFrom = () => {
      if (!hasFrom)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fromPositionId"],
          message: "Posição de origem é obrigatória",
        });
    };

    switch (data.type) {
      case "ENTRADA":
        requireTo();
        break;
      case "SAIDA":
        requireFrom();
        break;
      case "DEVOLUCAO":
        if (!data.direction) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["direction"],
            message: "Informe a direção da devolução",
          });
        } else if (data.direction === "CLIENTE") {
          requireTo();
        } else {
          requireFrom();
        }
        break;
      case "TRANSFERENCIA":
        requireFrom();
        requireTo();
        if (hasFrom && hasTo && data.fromPositionId === data.toPositionId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["toPositionId"],
            message: "Destino deve ser diferente da origem",
          });
        }
        break;
    }
  });

export type MovementInput = z.infer<typeof movementSchema>;
