/** pt-BR compact currency — e.g. R$ 1,2 M */
export const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

/** pt-BR full currency, no fractions — e.g. R$ 310.000 */
export const BRLFull = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/** pt-BR compact number — e.g. 1,2 M */
export const NUM = new Intl.NumberFormat('pt-BR', { notation: 'compact' });
