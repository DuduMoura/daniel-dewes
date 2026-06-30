import { z } from "zod";

// Fonte única de verdade dos dados de Produto.
// Validação (client + server) e tipos derivam deste schema.
export const productSchema = z.object({
  sku: z.string().min(1, "SKU é obrigatório").max(50),
  name: z.string().min(1, "Nome é obrigatório").max(120),
  description: z.string().max(500).optional().or(z.literal("")),
  minStock: z.coerce.number().int().min(0, "Mínimo não pode ser negativo").default(0),
  categoryId: z.string().cuid().optional().or(z.literal("")),
});

// Atualização: campos opcionais, mas exige o id.
export const updateProductSchema = productSchema.partial().extend({
  id: z.string().cuid(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
