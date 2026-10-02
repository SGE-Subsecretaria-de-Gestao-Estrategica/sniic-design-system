/**
 * Data contracts for the interactive, step-controlled charts.
 *
 * The charts take already-parsed rows so a host application stays in control
 * of fetching, caching, and SSR. Parsing a publication's own files into these
 * shapes is the host's job: the package ships no data and no loaders.
 */

/** One year of `LinhaParticipacaoChart`: an absolute value and its share of a total. */
export type LinhaParticipacaoDatum = {
	year: number;
	/** Absolute value — drawn as the line. */
	value: number;
	/** Share of a total, 0–1 — drawn as the bubble beneath. */
	share: number;
};

/** One group in one year of `LinhasComparadasChart`. */
export type LinhasComparadasDatum = {
	/** Series name, written at the line's end. */
	group: string;
	year: number;
	value: number;
};

/** One group in one year of `LinhasDiferencaChart`. */
export type LinhasDiferencaDatum = {
	/** Series name — the `featured` one or the `baseline`. */
	group: string;
	year: number;
	/** A rate, 0–1; the difference panel reads it in percentage points. */
	value: number;
};

/**
 * The two columns of `BolhasComparadasChart`: `grupo` is the one being
 * described, `referencia` the one it is compared against (drawn hatched).
 */
export type BolhasComparadasScope = 'grupo' | 'referencia';

/** One category in one scope of `BolhasComparadasChart`. */
export type BolhasComparadasDatum = {
	scope: BolhasComparadasScope;
	category: string;
	/** Share within the scope, 0–1. */
	share: number;
};

/** One category of `BarrasRankingChart`. */
export type BarrasRankingDatum = {
	/** Category name, written beside its bar. */
	label: string;
	/** Bar length; never negative — a ranking measures from zero. */
	value: number;
};

/**
 * One category of `BarrasDivergentesChart`: two magnitudes drawn in opposite
 * directions from a shared zero. Both are positive — direction is the
 * encoding, not the sign.
 */
export type BarrasDivergentesDatum = {
	label: string;
	/** Grows leftwards from zero. */
	left: number;
	/** Grows rightwards from zero. */
	right: number;
};

/** One category of `LinhasAntesDepoisChart`: the same measure at two moments. */
export type LinhasAntesDepoisDatum = {
	label: string;
	before: number;
	after: number;
};

/**
 * One step of `BarrasCascataChart`. `base` and `total` stand on zero and
 * measure a stock; `delta` floats from the running total it finds to the one
 * it leaves, and measures a change (negative values hang downwards).
 */
export type BarrasCascataDatum = {
	label: string;
	value: number;
	type: 'base' | 'delta' | 'total';
	/** Small lines under the label — the breakdown of an aggregated step. */
	detail?: string[];
	/** Overrides the default bar gradient for this step, as `CapsuleBar` takes it. */
	fill?: string | readonly [string, string];
};

/** One column of `ColunasEmpilhadasChart` / `ColunasFitasChart`: a label and a value per series. */
export type ColunasDatum = {
	label: string;
	values: Record<string, number>;
};

/** A stretch of columns marked with a bracket above the plot — "not measured here". */
export type ColunasSpan = { from: string; to: string; text: string };

/** One panel of `LinhasPaineisChart`: a series over the chart's shared `years`. */
export type LinhasPainel = {
	label: string;
	/** One value per year, in the order of `years`; `null` is a year not measured. */
	values: (number | null)[];
	/** Small line under the name — usually the panel's base. */
	note?: string;
};

/** A point of a concentration (Lorenz) curve: cumulative % of units, cumulative % of the total. */
export type CurvaConcentracaoPonto = [units: number, total: number];

/**
 * A reading marked on the curve. `top` is the share at the end of the
 * ordering the reading is about — the top 10% — which decides where the
 * marker lands; `label` is the whole sentence, because the value of a mark
 * is what lies between that point and the top, not the point's height.
 */
export type CurvaConcentracaoMarco = { top: number; label: string };

/** A reading block in the right gutter of `FaixasParticipacaoChart`, anchored on a year. */
export type FaixasParticipacaoDestaque = {
	year: number;
	/** Large value — the year's total, typically. */
	value?: string;
	title: string;
	note?: string;
};

/** A row of `BolhasMatrizChart`: one value per column, in the order of `columns`. */
export type BolhasMatrizLinha = {
	label: string;
	/** Small line under the name — usually the row's base. */
	note?: string;
	values: number[];
};

/** One ridge of `CristasDensidadeChart`. */
export type CristaDensidade = {
	label: string;
	note?: string;
	/** Density sampled on an even grid from 0 to `xMax`; the chart normalises its height. */
	density: number[];
	/** Text at the ridge's right end — usually the share past the reference. */
	value?: string;
};

/** A value per federative unit, by its two-letter code. */
export type MapaUfValor = { uf: string; value: number };

/** One category of `MapaUfChart` in categorical mode; `value` is its index. */
export type MapaUfCategoria = {
	label: string;
	/** Without it, the category takes the ramp step of its position. */
	color?: string;
};

/**
 * Two values per federative unit for `MapaHexagonalChart`: left and right bars.
 * `b` absent (or `null`) draws a single centred bar — a unit where both values
 * are the same thing, like the Distrito Federal for state and capital.
 */
export type MapaHexagonalValor = { uf: string; a: number; b?: number | null };

/**
 * The copy of `MapaHexagonalLegenda`. Each `*Label` is the bold lead-in, each
 * `*Text` the explanation after it; `**double asterisks**` set a word in bold.
 */
export type MapaHexagonalLegendaTexto = {
	title: string;
	/** Name inside the sample hexagon. */
	sampleLabel: string;
	totalLabel: string;
	totalText: string;
	excessLabel: string;
	excessText: string;
	/** Under the reference value, which the legend prints large. */
	referenceText: string;
	aLabel: string;
	aText: string;
	bLabel: string;
	bText: string;
};

/**
 * A measure of `TabelaBarrasChart`: one column of bars, on a scale of its own —
 * the columns of a table rarely share a unit.
 */
export type TabelaBarrasColuna = {
	label: string;
	/** Text of each value in this column; falls back to the chart's `formatValue`. */
	format?: (value: number) => string;
	/** A dashed line across the column at this value — a target, a parity. */
	reference?: number;
	/** Written under the column, at the reference line. */
	referenceLabel?: string;
	/** Copy for this column's stage in `tabelaBarrasSteps`; falls back to `label`. */
	stepLabel?: string;
};

/** A row of `TabelaBarrasChart`: one value per column, in the order of `columns`. */
export type TabelaBarrasLinha = {
	label: string;
	/** Small line under the name. */
	note?: string;
	/** `null` is a value that was not reported — written, never drawn as zero. */
	values: (number | null)[];
};
