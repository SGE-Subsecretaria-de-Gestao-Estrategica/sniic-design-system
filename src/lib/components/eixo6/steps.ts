/**
 * Narrative stages of the step-controlled charts, in order.
 *
 * Each chart reveals its stages cumulatively as `step` grows. A scrollytelling
 * host builds its sections from these arrays — swapping `label` for its own
 * copy, keeping the order and the count — and passes the matching index back
 * as the chart's `step`. They live in a plain module, not in each component's
 * `<script module>`, so a page that only needs the copy can import them
 * without pulling in the chart, and so the published type declarations carry
 * them.
 */
import type { ChartStep } from './types.js';

export const LINHA_PARTICIPACAO_STEPS: ChartStep[] = [
	{ id: 'linha', label: 'A série de valores absolutos' },
	{ id: 'valores', label: 'Os valores do início e do fim' },
	{ id: 'quebra', label: 'A quebra da série, quando há' },
	{ id: 'participacao', label: 'A participação no total, em bolhas' },
	{ id: 'nome', label: 'O nome da série no último ano' }
];

export const LINHAS_COMPARADAS_STEPS: ChartStep[] = [
	{ id: 'destaque', label: 'O grupo destacado ao longo dos anos' },
	{ id: 'demais', label: 'Os demais grupos entram para comparação' },
	{ id: 'quebra', label: 'A quebra da série, quando há' },
	{ id: 'final', label: 'Onde cada grupo chegou no último ano' }
];

export const LINHAS_DIFERENCA_STEPS: ChartStep[] = [
	{ id: 'referencia', label: 'A série de referência' },
	{ id: 'destaque', label: 'A série destacada' },
	{ id: 'diferenca', label: 'A distância entre as duas, em pontos percentuais' },
	{ id: 'final', label: 'A diferença no último ano' }
];

export const BOLHAS_COMPARADAS_STEPS: ChartStep[] = [
	{ id: 'grupo', label: 'A repartição no grupo' },
	{ id: 'referencia', label: 'A mesma repartição na referência' },
	{ id: 'diferenca', label: 'Onde as duas repartições se afastam' }
];

export const BARRAS_RANKING_STEPS: ChartStep[] = [
	{ id: 'barras', label: 'As categorias, da maior à menor' },
	{ id: 'valores', label: 'O valor de cada categoria' }
];

export const BARRAS_DIVERGENTES_STEPS: ChartStep[] = [
	{ id: 'direita', label: 'Uma parcela, a partir do zero' },
	{ id: 'esquerda', label: 'A parcela oposta, na mesma escala' },
	{ id: 'valores', label: 'O valor de cada parcela' }
];

export const LINHAS_ANTES_DEPOIS_STEPS: ChartStep[] = [
	{ id: 'antes', label: 'O valor de antes, categoria a categoria' },
	{ id: 'depois', label: 'O valor de depois, e o traço da mudança' },
	{ id: 'valores', label: 'Os valores de cada ponta' }
];

export const BARRAS_CASCATA_STEPS: ChartStep[] = [
	{ id: 'inicio', label: 'O estoque de partida' },
	{ id: 'variacoes', label: 'As parcelas que levam de um estoque ao outro' },
	{ id: 'total', label: 'O estoque de chegada' }
];

export const COLUNAS_EMPILHADAS_STEPS: ChartStep[] = [
	{ id: 'colunas', label: 'As colunas e o que cada uma soma' },
	{ id: 'valores', label: 'O valor de cada parcela' }
];

export const LINHAS_PAINEIS_STEPS: ChartStep[] = [
	{ id: 'referencia', label: 'A referência, repetida em cada painel' },
	{ id: 'paineis', label: 'Cada grupo diante da referência' },
	{ id: 'valores', label: 'Onde cada grupo começa e termina' }
];

export const CURVA_CONCENTRACAO_STEPS: ChartStep[] = [
	{ id: 'igualdade', label: 'Onde a curva estaria se todos tivessem o mesmo' },
	{ id: 'curva', label: 'A curva de fato' },
	{ id: 'marcos', label: 'Quanto concentram os que mais têm' }
];

export const FAIXAS_PARTICIPACAO_STEPS: ChartStep[] = [
	{ id: 'faixas', label: 'A participação de cada categoria, ano a ano' },
	{ id: 'nomes', label: 'O nome de cada faixa onde ela é mais larga' },
	{ id: 'destaques', label: 'Os anos que mudam a história' }
];

export const BOLHAS_MATRIZ_STEPS: ChartStep[] = [
	{ id: 'bolhas', label: 'O tamanho de cada combinação' },
	{ id: 'valores', label: 'O valor de cada bolha' }
];

export const CRISTAS_DENSIDADE_STEPS: ChartStep[] = [
	{ id: 'formas', label: 'A forma de cada distribuição' },
	{ id: 'referencia', label: 'A referência, e quem a ultrapassa' },
	{ id: 'valores', label: 'Quanto de cada grupo passa da referência' }
];

export const MAPA_CLASSES_STEPS: ChartStep[] = [
	{ id: 'mapa', label: 'O território, sem valores' },
	{ id: 'classes', label: 'Cada unidade na cor da sua classe' }
];

/**
 * `MapaMunicipiosChart`. The zoom is not a stage: it follows `zoomTo`, so a
 * host can fly between municipalities while staying on the last step.
 */
export const MAPA_DESTAQUES_STEPS: ChartStep[] = [
	{ id: 'mapa', label: 'O território, sem destaques' },
	{ id: 'destaques', label: 'Os maiores, marcados no mapa' },
	{ id: 'ranking', label: 'O ranking, com o valor de cada um' }
];

/**
 * `MapaHexagonalChart`. After the reference, one stage per region — in the
 * order of `REGIOES` — outlines it and dims the others.
 */
export const MAPA_HEXAGONAL_STEPS: ChartStep[] = [
	{ id: 'a', label: 'O primeiro valor de cada UF' },
	{ id: 'b', label: 'O segundo valor, ao lado' },
	{ id: 'referencia', label: 'A referência, e quem a supera' },
	{ id: 'norte', label: 'O Norte' },
	{ id: 'nordeste', label: 'O Nordeste' },
	{ id: 'centro-oeste', label: 'O Centro-Oeste' },
	{ id: 'sudeste', label: 'O Sudeste' },
	{ id: 'sul', label: 'O Sul' }
];

/**
 * `TabelaBarrasChart`. One stage per column, in order — each brings its
 * measure in and steps the ones already read back — then the whole table,
 * with the total when there is one. The stages follow the table's columns,
 * so they are built from them rather than fixed.
 */
export function tabelaBarrasSteps(
	columns: { label: string; stepLabel?: string }[],
	options: { total?: boolean } = {}
): ChartStep[] {
	return [
		...columns.map((column, c) => ({ id: `coluna-${c}`, label: column.stepLabel ?? column.label })),
		{ id: 'tabela', label: options.total ? 'A tabela inteira, com o total' : 'A tabela inteira' }
	];
}
