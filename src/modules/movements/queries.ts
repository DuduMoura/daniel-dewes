import { db } from "@/lib/db";

// Leituras do módulo de movimentação — consumidas por Server Components.

export type MovementListItem = Awaited<
  ReturnType<typeof listMovements>
>[number];

// Forma comum do histórico (produto, posições com endereço, fornecedor) —
// compartilhada pelo histórico global e pelo histórico de um produto, para
// que a mesma `MovementsTable` renderize ambos.
const movementInclude = {
  product: { select: { id: true, name: true, sku: true } },
  fromPosition: { include: { aisle: { include: { area: true } } } },
  toPosition: { include: { aisle: { include: { area: true } } } },
  supplier: { select: { id: true, name: true } },
} as const;

// Histórico: movimentações mais recentes primeiro, com produto, posições e fornecedor.
export async function listMovements(limit = 100) {
  return db.movement.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: movementInclude,
  });
}

// Histórico de um produto específico (mesma forma de `listMovements`).
export async function listMovementsByProduct(productId: string, limit = 20) {
  return db.movement.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: movementInclude,
  });
}

export type PositionOption = {
  id: string;
  label: string; // "ÁREA / CORREDOR / POSIÇÃO"
};

// Todas as posições com rótulo hierárquico (para o seletor de destino).
export async function listPositionOptions(): Promise<PositionOption[]> {
  const positions = await db.position.findMany({
    orderBy: { code: "asc" },
    include: { aisle: { include: { area: true } } },
  });
  return positions.map((p) => ({
    id: p.id,
    label: `${p.aisle.area.code} / ${p.aisle.code} / ${p.code}`,
  }));
}

export type StockEntry = {
  productId: string;
  positionId: string;
  quantity: number;
};

// Saldos com quantidade > 0 (para o seletor de origem filtrar por produto).
export async function listStockWithBalance(): Promise<StockEntry[]> {
  const items = await db.stockItem.findMany({
    where: { quantity: { gt: 0 } },
    select: { productId: true, positionId: true, quantity: true },
  });
  return items;
}

// Sugestão de posição de put-away para um produto (versão server-side),
// reusando a estratégia pura. Carrega posições e saldos e delega.
export async function suggestPutAwayPosition(
  productId: string,
): Promise<string | null> {
  const [positions, stock] = await Promise.all([
    listPositionOptions(),
    listStockWithBalance(),
  ]);
  const { suggestPutAwayPosition: suggest } = await import("./put-away");
  return suggest(productId, positions, stock);
}
