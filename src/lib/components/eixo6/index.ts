/**
 * Gráficos interativos controlados por etapa — nascidos no Eixo 6 e a
 * referência para os demais.
 *
 * Os nomes dizem a forma, não o tema; o texto da publicação entra por prop.
 * Cada gráfico:
 *
 * - recebe linhas já parseadas (ver `data.ts` para os formatos) — o pacote não
 *   traz dados nem loaders;
 * - preenche a largura do contêiner, então o host controla o layout;
 * - tem crosshair ou tooltip por marca, navegação por teclado e tabela
 *   acessível;
 * - aceita `step`, `highlight` e `focusIndex`, para que uma página de
 *   scrollytelling conduza a narrativa de fora. `step = -1` (o padrão)
 *   desenha o gráfico completo.
 *
 * As `*_STEPS` descrevem as etapas de cada gráfico, em ordem, para o host
 * gerar as seções de scroll a partir da mesma fonte que o gráfico lê.
 */

export { default as LinhaParticipacaoChart } from './LinhaParticipacaoChart.svelte';
export { default as LinhasComparadasChart } from './LinhasComparadasChart.svelte';
export { default as LinhasDiferencaChart } from './LinhasDiferencaChart.svelte';
export { default as BolhasComparadasChart } from './BolhasComparadasChart.svelte';
export { default as BarrasRankingChart } from './BarrasRankingChart.svelte';
export { default as BarrasDivergentesChart } from './BarrasDivergentesChart.svelte';
export { default as LinhasAntesDepoisChart } from './LinhasAntesDepoisChart.svelte';
export { default as BarrasCascataChart } from './BarrasCascataChart.svelte';
export { default as ColunasEmpilhadasChart } from './ColunasEmpilhadasChart.svelte';
export { default as LinhasPaineisChart } from './LinhasPaineisChart.svelte';
export { default as CurvaConcentracaoChart } from './CurvaConcentracaoChart.svelte';
export { default as FaixasParticipacaoChart } from './FaixasParticipacaoChart.svelte';
export { default as BolhasMatrizChart } from './BolhasMatrizChart.svelte';
export { default as PontosPaineisChart } from './PontosPaineisChart.svelte';
export { default as CristasDensidadeChart } from './CristasDensidadeChart.svelte';
export { default as MapaUfChart } from './MapaUfChart.svelte';
export { default as MapaMunicipiosChart } from './MapaMunicipiosChart.svelte';
export { default as MapaHexagonalChart } from './MapaHexagonalChart.svelte';

export * from './steps.js';

export type * from './data.js';
export { createBreakScale, paddedExtent, responsiveMargin } from './scales.js';
export type { BreakScale } from './scales.js';
export type {
	ChartStep,
	FrameProps,
	LegendItem,
	ScrollytellingProps,
	TableView
} from './types.js';
