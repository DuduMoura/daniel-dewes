import { z } from "zod";

// Fonte única de verdade dos dados de Categoria.
export const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(80),
});

export type CategoryInput = z.infer<typeof categorySchema>;
