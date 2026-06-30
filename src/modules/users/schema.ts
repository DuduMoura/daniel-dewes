import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  role: z.enum(["GESTOR", "OPERADOR", "COMPRAS"]),
});

export const updateUserSchema = z.object({
  id: z.string().cuid("ID inválido"),
  name: z.string().min(1, "Nome obrigatório"),
  role: z.enum(["GESTOR", "OPERADOR", "COMPRAS"]),
});

export const resetPasswordSchema = z
  .object({
    id: z.string().cuid("ID inválido"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirm: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
