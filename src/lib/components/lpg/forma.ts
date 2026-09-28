/**
 * Geometria comum às figuras da LPG. As barras do boletim têm cantos quase
 * retos — não as pílulas do Eixo 1 —, e o raio mora aqui para que ranking,
 * divergente, colunas, composição e mosaico falem a mesma língua.
 */

/** Raio dos cantos das barras, em unidades autorais (multiplicar por `k`). */
export const RAIO_BARRA = 2;

/**
 * Retângulo com os cantos de cada ponta arredondados à parte: as pontas
 * externas de uma barra empilhada levam o raio, as junções ficam retas.
 */
export function segmentoPath(
  x: number,
  y: number,
  w: number,
  h: number,
  raio: number,
  first: boolean,
  last: boolean,
): string {
  const r = Math.max(0, Math.min(raio, w / 2, h / 2));
  const rL = first ? r : 0;
  const rR = last ? r : 0;
  return [
    `M${x + rL},${y}`,
    `H${x + w - rR}`,
    rR ? `A${rR},${rR} 0 0 1 ${x + w},${y + rR}` : '',
    `V${y + h - rR}`,
    rR ? `A${rR},${rR} 0 0 1 ${x + w - rR},${y + h}` : '',
    `H${x + rL}`,
    rL ? `A${rL},${rL} 0 0 1 ${x},${y + h - rL}` : '',
    `V${y + rL}`,
    rL ? `A${rL},${rL} 0 0 1 ${x + rL},${y}` : '',
    'Z',
  ]
    .filter(Boolean)
    .join(' ');
}
