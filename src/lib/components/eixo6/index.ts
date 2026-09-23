/**
 * Eixo 6 — Trabalho e renda na Economia Criativa.
 *
 * Four interactive, prop-driven charts meant to be embedded in a host
 * application. Every one of them:
 *
 * - takes already-parsed rows (see `data.ts` for the shapes and parsers);
 * - fills the width of its container, so the host controls layout;
 * - ships a crosshair or per-mark tooltip plus keyboard scrubbing;
 * - accepts `step`, `highlight` and `focusIndex` so a scrollytelling page can
 *   drive the narrative from outside. `step = -1` (the default) renders the
 *   finished chart.
 *
 * The `*_STEPS` arrays describe each chart's stages in order, so the host can
 * generate its scroll sections from the same source the chart reads.
 */

export { default as TrabalhadoresCulturaChart } from './TrabalhadoresCulturaChart.svelte';
export { default as SetoresComparadosChart } from './SetoresComparadosChart.svelte';
export { default as InformalidadeChart } from './InformalidadeChart.svelte';
export { default as RacaCorChart } from './RacaCorChart.svelte';

export * from './steps.js';

export * from './data.js';
export { createBreakScale, paddedExtent, responsiveMargin } from './scales.js';
export type { BreakScale } from './scales.js';
export type {
	ChartStep,
	FrameProps,
	LegendItem,
	ScrollytellingProps,
	TableView
} from './types.js';
