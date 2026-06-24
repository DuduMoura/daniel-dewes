import type { PositionOption, StockEntry } from "./queries";

// Estratégia de put-away (consolidação): recomenda onde guardar a entrada de um produto.
// 1) posição onde o produto JÁ tem maior saldo (consolida); 2) senão, a primeira
// posição na ordem do armazém; 3) sem posições → sem sugestão (null).
//
// Função pura — reusável no cliente (a partir dos dados já carregados no form)
// e no servidor.
export function suggestPutAwayPosition(
  productId: string,
  positions: PositionOption[],
  stock: StockEntry[],
): string | null {
  if (positions.length === 0) return null;

  const ofProduct = stock
    .filter((s) => s.productId === productId && s.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity);

  if (ofProduct.length > 0) {
    // Garante que a posição ainda existe na lista de posições.
    const top = ofProduct.find((s) => positions.some((p) => p.id === s.positionId));
    if (top) return top.positionId;
  }

  // `positions` já vem ordenada por Área/Corredor/Posição (listPositionOptions).
  return positions[0].id;
}
