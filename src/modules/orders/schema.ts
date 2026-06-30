import { z } from "zod";

// Fonte única de verdade dos pedidos de expedição.

// Criação: ao menos um item (produto + quantidade ≥ 1).
export const createOrderSchema = z.object({
  note: z.string().max(500).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().cuid("Produto inválido"),
        quantity: z.coerce
          .number()
          .int("Quantidade deve ser inteira")
          .min(1, "Quantidade deve ser ≥ 1"),
      }),
    )
    .min(1, "Informe ao menos um item"),
});

// Coleta de um item: posição de onde foi coletado.
export const pickItemSchema = z.object({
  itemId: z.string().cuid(),
  positionId: z.string().cuid("Posição inválida"),
});

export const orderIdSchema = z.object({
  orderId: z.string().cuid(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type PickItemInput = z.infer<typeof pickItemSchema>;
