"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UsersTable } from "./users-table";
import { UserFormDialog } from "./user-form-dialog";
import type { UserListItem } from "../queries";

type Props = {
  users: UserListItem[];
  currentUserId: string;
};

export function UsersManager({ users, currentUserId }: Props) {
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 size-4" />
          Novo usuário
        </Button>
      </div>

      <UsersTable users={users} currentUserId={currentUserId} />

      <UserFormDialog
        open={creating}
        onOpenChange={setCreating}
        currentUserId={currentUserId}
      />
    </div>
  );
}
