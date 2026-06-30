import { z } from "zod";

// Fonte única de verdade dos dados de Fornecedor.
export const supplierSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(120),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  contact: z.string().max(120).optional().or(z.literal("")),
  // IDs dos produtos fornecidos (relação N:N).
  productIds: z.array(z.string().cuid()).default([]),
});

export const updateSupplierSchema = supplierSchema.partial().extend({
  id: z.string().cuid(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
