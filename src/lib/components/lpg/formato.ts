/**
 * Formatação e textos comuns às figuras da LPG — os mesmos formatos do app do
 * boletim (`LPG-2026/data-viz/src/lib/format.ts`).
 */

const nf = (opts: Intl.NumberFormatOptions) => new Intl.NumberFormat('pt-BR', opts);

const num0 = nf({ maximumFractionDigits: 0 });
const num1 = nf({ minimumFractionDigits: 1, maximumFractionDigits: 1 });
const num2 = nf({ minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 199450 → "199.450" */
export const num = (v: number) => num0.format(v);

/** 71.26 → "71,3%" (entrada em escala 0–100) */
export const pct = (v: number) => `${num1.format(v)}%`;

/** 20.58 → "R$ 20,58" */
export const brl = (v: number) => `R$ ${num2.format(v)}`;

/** 4179362818 → "R$ 4,18 bi"; 20954 → "R$ 21,0 mil" */
export function brlCurto(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e9) return `R$ ${num2.format(v / 1e9)} bi`;
  if (a >= 1e6) return `R$ ${num1.format(v / 1e6)} mi`;
  if (a >= 1e3) return `R$ ${num1.format(v / 1e3)} mil`;
  return `R$ ${num0.format(v)}`;
}

export const FONTE = 'Fonte: BB Gestão Ágil. Elaboração MinC.';

export const REGIOES = ['Norte', 'Nordeste', 'Sudeste', 'Sul', 'Centro-Oeste'];

export const FAIXAS = [
  'Até 2 mil',
  '2 a 10 mil',
  '10 a 50 mil',
  '50 a 200 mil',
  '200 a 500 mil',
  '500 mil a 1 milhão',
  'Acima de 1 milhão',
];

/** Rótulos curtos para as pastilhas da legenda. */
export const FAIXAS_CURTAS: Record<string, string> = {
  'Até 2 mil': 'Até 2 mil',
  '2 a 10 mil': '2–10 mil',
  '10 a 50 mil': '10–50 mil',
  '50 a 200 mil': '50–200 mil',
  '200 a 500 mil': '200–500 mil',
  '500 mil a 1 milhão': '500 mil–1 mi',
  'Acima de 1 milhão': '> 1 mi',
};
