/**
 * Data contracts for the Eixo 6 charts.
 *
 * The charts take already-parsed rows so a host application stays in control
 * of fetching, caching, and SSR. The `parse*` helpers convert the published
 * semicolon-delimited CSVs into those rows, and the `load*` helpers do the
 * fetch as well for the simple case.
 */
import * as d3 from 'd3';

/** Year the RAIS series breaks methodologically; segments are drawn apart. */
export const RAIS_BREAK_YEAR = 2022;

// ---------------------------------------------------------------------------
// 6.5 — postos de trabalho na Economia Criativa
// ---------------------------------------------------------------------------

export type TrabalhadoresCulturaDatum = {
	year: number;
	/** Formal + informal jobs in the creative economy. */
	workers: number;
	/** Share of all Brazilian employment relationships, 0–1. */
	share: number;
};

export function parseTrabalhadoresCultura(
	rows: d3.DSVRowArray<string> | d3.DSVRowString<string>[]
): TrabalhadoresCulturaDatum[] {
	return Array.from(rows, (row) => ({
		year: +row.ano!,
		workers: +row.total_vinculos_formal_informal!,
		share: +row.participacao_pct!
	})).sort((a, b) => a.year - b.year);
}

// ---------------------------------------------------------------------------
// E6S2 — Economia Criativa comparada a outros setores
// ---------------------------------------------------------------------------

export type SetorAnoDatum = {
	/** Sector name, e.g. "Economia Criativa", "Agricultura". */
	group: string;
	year: number;
	workers: number;
};

export function parseSetores(
	rows: d3.DSVRowArray<string> | d3.DSVRowString<string>[]
): SetorAnoDatum[] {
	return Array.from(rows, (row) => ({
		group: row.grupo!,
		year: +row.ano!,
		workers: +row.total_vinculos!
	})).sort((a, b) => a.year - b.year);
}

// ---------------------------------------------------------------------------
// 6.8 — taxa de informalidade
// ---------------------------------------------------------------------------

export type InformalidadeDatum = {
	group: string;
	year: number;
	/** Informality rate, 0–1. */
	rate: number;
};

export function parseInformalidade(
	rows: d3.DSVRowArray<string> | d3.DSVRowString<string>[]
): InformalidadeDatum[] {
	return Array.from(rows, (row) => ({
		group: row.grupo!,
		year: +row.ano!,
		rate: +row.taxa_informalidade!
	})).sort((a, b) => a.year - b.year);
}

// ---------------------------------------------------------------------------
// 6.13 / 6.21 — composição por cor ou raça
// ---------------------------------------------------------------------------

/** `EC` is the creative economy; `BR` is the country-wide reference. */
export type RacaCorScope = 'EC' | 'BR';

export type RacaCorDatum = {
	scope: RacaCorScope;
	/** Category label as published, e.g. "Preta/Parda". */
	category: string;
	/** Share within the scope, 0–1. */
	share: number;
};

export function parseRacaCor(
	rows: d3.DSVRowArray<string> | d3.DSVRowString<string>[]
): RacaCorDatum[] {
	return Array.from(rows, (row) => ({
		scope: row.escopo as RacaCorScope,
		category: row.raca_cor!,
		share: +row.participacao_pct!
	}));
}

// ---------------------------------------------------------------------------
// Loaders
// ---------------------------------------------------------------------------

/** Reads one of the published semicolon-delimited Eixo 6 CSVs. */
async function loadCsv(url: string) {
	return d3.dsv(';', url);
}

export async function loadTrabalhadoresCultura(url = '/data/eixo6/6.5.csv') {
	return parseTrabalhadoresCultura(await loadCsv(url));
}

export async function loadSetores(
	url = '/data/eixo6/E6S2-n-trabalhadores-cultura-e-outros-setores-ano.csv'
) {
	return parseSetores(await loadCsv(url));
}

export async function loadInformalidade(url = '/data/eixo6/6.8.csv') {
	return parseInformalidade(await loadCsv(url));
}

export async function loadRacaCor(url = '/data/eixo6/6.13_6.21.csv') {
	return parseRacaCor(await loadCsv(url));
}
