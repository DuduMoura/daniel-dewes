import { db } from "@/lib/db";

export type UserListItem = Awaited<ReturnType<typeof listUsers>>[number];

export async function listUsers() {
  return db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });
}
