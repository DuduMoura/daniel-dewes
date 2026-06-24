import { db } from "@/lib/db";

// Leituras do módulo de localização — consumidas por Server Components.

export type AreaWithChildren = Awaited<ReturnType<typeof listAreas>>[number];

// Hierarquia completa: áreas → corredores → posições, ordenada por código.
// A contagem de posições por corredor vem de `_count` (sem N+1).
export async function listAreas() {
  return db.area.findMany({
    orderBy: { code: "asc" },
    include: {
      aisles: {
        orderBy: { code: "asc" },
        include: {
          positions: { orderBy: { code: "asc" } },
          _count: { select: { positions: true } },
        },
      },
      _count: { select: { aisles: true } },
    },
  });
}
