import type { ChartStep } from '../eixo6/types.js';

/** The category of one federative unit for `MapaHexagonalCategoricoChart`, by its name. */
export type MapaHexagonalCategoricoValor = { uf: string; category: string };

/** One category of `MapaHexagonalCategoricoChart`: its order in the list is its order on the map. */
export type MapaHexagonalCategoria = {
	label: string;
	/** Without it, the category takes the ramp step of its position (or a palette hue, unordered). */
	color?: string;
	/** Copy for its scrollytelling stage; defaults to `label`. */
	stepLabel?: string;
};

/**
 * `MapaHexagonalCategoricoChart`. One stage per category, in the chart's
 * order: each paints its UFs and keeps the earlier ones, so an ordered set —
 * stages of a process — builds up from the first to the last. Built from the
 * categories, like `tabelaBarrasSteps`.
 */
export function mapaHexagonalCategoricoSteps(
	categories: { label: string; stepLabel?: string }[]
): ChartStep[] {
	return categories.map((category, c) => ({
		id: `categoria-${c}`,
		label: category.stepLabel ?? category.label
	}));
}
