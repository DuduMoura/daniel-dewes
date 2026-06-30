"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser, updateUser } from "../actions";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "../schema";
import type { UserListItem } from "../queries";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserListItem;
  currentUserId: string;
};

export function UserFormDialog({ open, onOpenChange, user, currentUserId }: Props) {
  const isEdit = !!user;

  const createForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "OPERADOR" },
  });

  const editForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    if (user) {
      editForm.reset({ id: user.id, name: user.name, role: user.role });
    } else {
      createForm.reset({ name: "", email: "", password: "", role: "OPERADOR" });
    }
  }, [user, open]);

  async function onCreateSubmit(data: CreateUserInput) {
    const result = await createUser(data);
    if (result.ok) {
      toast.success("Usuário criado.");
      onOpenChange(false);
    } else {
      Object.entries(result.errors).forEach(([field, msgs]) => {
        createForm.setError(field as keyof CreateUserInput, {
          message: msgs[0],
        });
      });
    }
  }

  async function onEditSubmit(data: UpdateUserInput) {
    const result = await updateUser(data);
    if (result.ok) {
      toast.success("Usuário atualizado.");
      onOpenChange(false);
    } else {
      Object.entries(result.errors).forEach(([field, msgs]) => {
        editForm.setError(field as keyof UpdateUserInput, { message: msgs[0] });
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar usuário" : "Novo usuário"}</DialogTitle>
        </DialogHeader>

        {isEdit ? (
          <form
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className="space-y-4"
          >
            <input type="hidden" {...editForm.register("id")} />
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input {...editForm.register("name")} />
              {editForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Perfil</Label>
              <Select
                value={editForm.watch("role")}
                onValueChange={(v) =>
                  editForm.setValue("role", v as UpdateUserInput["role"])
                }
                disabled={user?.id === currentUserId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GESTOR">Gestor</SelectItem>
                  <SelectItem value="OPERADOR">Operador</SelectItem>
                  <SelectItem value="COMPRAS">Compras</SelectItem>
                </SelectContent>
              </Select>
              {editForm.formState.errors.role && (
                <p className="text-xs text-destructive">
                  {editForm.formState.errors.role.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={editForm.formState.isSubmitting}
              >
                {editForm.formState.isSubmitting ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input {...createForm.register("name")} />
              {createForm.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" {...createForm.register("email")} />
              {createForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Senha</Label>
              <Input type="password" {...createForm.register("password")} />
              {createForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {createForm.formState.errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Perfil</Label>
              <Select
                value={createForm.watch("role")}
                onValueChange={(v) =>
                  createForm.setValue("role", v as CreateUserInput["role"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GESTOR">Gestor</SelectItem>
                  <SelectItem value="OPERADOR">Operador</SelectItem>
                  <SelectItem value="COMPRAS">Compras</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createForm.formState.isSubmitting}
              >
                {createForm.formState.isSubmitting ? "Criando…" : "Criar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
