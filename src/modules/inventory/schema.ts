import { z } from "zod";

// Fonte única de verdade do ciclo de inventário.

// Abertura: escopo opcional por área(s); sem seleção = armazém inteiro.
export const openInventorySchema = z.object({
  areaIds: z.array(z.string().cuid()).default([]),
  note: z.string().max(500).optional().or(z.literal("")),
});

// Contagem de um item: quantidade física informada pelo operador.
export const countSchema = z.object({
  itemId: z.string().cuid(),
  countedQty: z.coerce
    .number()
    .int("Quantidade deve ser inteira")
    .min(0, "Quantidade não pode ser negativa"),
});

// Encerramento de um inventário aberto.
export const closeInventorySchema = z.object({
  inventoryId: z.string().cuid(),
});

export type OpenInventoryInput = z.infer<typeof openInventorySchema>;
export type CountInput = z.infer<typeof countSchema>;
export type CloseInventoryInput = z.infer<typeof closeInventorySchema>;
