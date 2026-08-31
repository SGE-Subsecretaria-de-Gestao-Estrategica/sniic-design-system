/**
 * Narrative stages for the Eixo 6 charts, in order.
 *
 * A scrollytelling host builds its sections from these arrays and passes the
 * matching index back as the chart's `step`. They live in a plain module — not
 * in each component's `<script module>` — so a page that only needs the copy
 * can import them without pulling in the chart, and so the published type
 * declarations carry them.
 */
import type { ChartStep } from './types.js';

export const TRABALHADORES_CULTURA_STEPS: ChartStep[] = [
	{ id: 'linha', label: 'A série de postos de trabalho na Economia Criativa' },
	{ id: 'valores', label: 'Os valores de início e fim da série' },
	{ id: 'quebra', label: 'A quebra metodológica da RAIS em 2022' },
	{ id: 'participacao', label: 'A participação no total de vínculos do país' },
	{ id: 'hoje', label: 'Onde a Economia Criativa chegou no último ano' }
];

export const SETORES_STEPS: ChartStep[] = [
	{ id: 'ec', label: 'A Economia Criativa ao longo dos anos' },
	{ id: 'setores', label: 'Outros setores entram para comparação' },
	{ id: 'quebra', label: 'A quebra metodológica da RAIS em 2022' },
	{ id: 'hoje', label: 'Onde cada setor chegou no último ano' }
];

export const INFORMALIDADE_STEPS: ChartStep[] = [
	{ id: 'brasil', label: 'A taxa de informalidade no Brasil' },
	{ id: 'ec', label: 'A taxa na Economia Criativa' },
	{ id: 'diferenca', label: 'A distância entre as duas, em pontos percentuais' },
	{ id: 'hoje', label: 'A diferença no último ano' }
];

export const RACA_COR_STEPS: ChartStep[] = [
	{ id: 'ec', label: 'A composição por cor ou raça na Economia Criativa' },
	{ id: 'brasil', label: 'A mesma composição no conjunto do país' },
	{ id: 'diferenca', label: 'Onde as duas composições se afastam' }
];

/** Series each chart reveals first and paints in the emphasis colour. */
export const SETOR_DESTAQUE = 'Economia Criativa';
export const INFORMALIDADE_DESTAQUE = 'Economia Criativa';
