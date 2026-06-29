"use client";

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
import { resetPassword } from "../actions";
import { resetPasswordSchema, type ResetPasswordInput } from "../schema";
import type { UserListItem } from "../queries";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserListItem;
};

export function ResetPasswordDialog({ open, onOpenChange, user }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { id: user.id },
  });

  async function onSubmit(data: ResetPasswordInput) {
    const result = await resetPassword(data);
    if (result.ok) {
      toast.success("Senha redefinida com sucesso.");
      reset();
      onOpenChange(false);
    } else {
      toast.error(Object.values(result.errors).flat()[0]);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redefinir senha — {user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("id")} />
          <div className="space-y-1.5">
            <Label>Nova senha</Label>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Confirmar senha</Label>
            <Input type="password" {...register("confirm")} />
            {errors.confirm && (
              <p className="text-xs text-destructive">
                {errors.confirm.message}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando…" : "Redefinir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
