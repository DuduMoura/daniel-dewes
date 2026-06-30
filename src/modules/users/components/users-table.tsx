"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal, KeyRound, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteUser } from "../actions";
import { UserFormDialog } from "./user-form-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import type { UserListItem } from "../queries";

const ROLE_LABELS: Record<string, string> = {
  GESTOR: "Gestor",
  OPERADOR: "Operador",
  COMPRAS: "Compras",
};

const ROLE_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  GESTOR: "default",
  OPERADOR: "secondary",
  COMPRAS: "outline",
};

type Props = {
  users: UserListItem[];
  currentUserId: string;
};

export function UsersTable({ users, currentUserId }: Props) {
  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [resetUser, setResetUser] = useState<UserListItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<UserListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    const result = await deleteUser(deleteConfirm.id);
    setDeleting(false);
    if (result.ok) {
      toast.success("Usuário excluído.");
      setDeleteConfirm(null);
    } else {
      toast.error(Object.values(result.errors).flat()[0]);
    }
  }

  if (users.length === 0) {
    return (
      <div className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
        Nenhum usuário cadastrado.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANTS[user.role]}>
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setEditUser(user)}
                      title="Editar"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => setResetUser(user)}
                      title="Redefinir senha"
                    >
                      <KeyRound className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirm(user)}
                      disabled={user.id === currentUserId}
                      title="Excluir"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editUser && (
        <UserFormDialog
          open
          onOpenChange={(open) => !open && setEditUser(null)}
          user={editUser}
          currentUserId={currentUserId}
        />
      )}

      {resetUser && (
        <ResetPasswordDialog
          open
          onOpenChange={(open) => !open && setResetUser(null)}
          user={resetUser}
        />
      )}

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir o usuário{" "}
            <strong>{deleteConfirm?.name}</strong>? Esta ação não pode ser
            desfeita.
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo…" : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
