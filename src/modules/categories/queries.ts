import { db } from "@/lib/db";

// Leituras do módulo de categorias — consumidas por Server Components.
export async function listCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}
