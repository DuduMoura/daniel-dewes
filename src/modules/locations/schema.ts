import { z } from "zod";

// Fonte única de verdade da hierarquia física do armazém.
// O `code` é o endereço operacional — normalizado (trim + uppercase) para
// evitar duplicatas como "a1"/"A1".
const code = z
  .string()
  .min(1, "Código é obrigatório")
  .max(30)
  .transform((v) => v.trim().toUpperCase());

// --- Área ---
export const areaSchema = z.object({
  code,
  name: z.string().min(1, "Nome é obrigatório").max(120),
});

export const updateAreaSchema = areaSchema.extend({
  id: z.string().cuid(),
});

// --- Corredor ---
export const aisleSchema = z.object({
  code,
  areaId: z.string().cuid("Área inválida"),
});

export const updateAisleSchema = aisleSchema.extend({
  id: z.string().cuid(),
});

// --- Posição ---
export const positionSchema = z.object({
  code,
  aisleId: z.string().cuid("Corredor inválido"),
});

export const updatePositionSchema = positionSchema.extend({
  id: z.string().cuid(),
});

export type AreaInput = z.infer<typeof areaSchema>;
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
export type AisleInput = z.infer<typeof aisleSchema>;
export type UpdateAisleInput = z.infer<typeof updateAisleSchema>;
export type PositionInput = z.infer<typeof positionSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
