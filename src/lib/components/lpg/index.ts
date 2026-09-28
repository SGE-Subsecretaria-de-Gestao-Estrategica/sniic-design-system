/**
 * LPG — boletim da Lei Paulo Gustavo (distribuição territorial).
 *
 * Os gráficos que `LPG-2026/data-viz` montava com os componentes genéricos do
 * pacote (`GroupedColumnChart`, `HorizontalStackedBarChart`, `ChoroplethMap`,
 * `DonutChart`…), refeitos no idioma das figuras de Cultura em Números: cartão
 * SVG autocontido, com título, subtítulo, legenda em pastilhas, nota e fonte
 * desenhados dentro do `<svg>`, na escala de impressão A4 do Eixo 1.
 *
 * A forma vem do Eixo 1 — quatro bases são usadas direto de lá
 * (`BarraRankingChart`, `BarraDivergenteChart`, `ColunaCategoriaChart`,
 * `CoropletoUfChart`) e duas foram criadas aqui no mesmo idioma
 * (`BarraComposicaoChart`, `MosaicoChart`). A cor vem da PNAB: as rampas
 * `colorScales` do design system, as mesmas do app do boletim — ver `cores.ts`.
 *
 * Os dados são os CSVs de `LPG-2026/data-viz/data/`, convertidos para JSON em
 * `./data/` (todos pequenos o bastante para import estático).
 */

export { default as BarraComposicaoChart } from './BarraComposicaoChart.svelte';
export type { LinhaComposicao } from './BarraComposicaoChart.svelte';
export { default as MosaicoChart } from './MosaicoChart.svelte';
export type { PecaMosaico } from './MosaicoChart.svelte';
export { default as FluxoComposicaoChart } from './FluxoComposicaoChart.svelte';
export type { BarraFluxo, CategoriaFluxo } from './FluxoComposicaoChart.svelte';
export { default as PainelMetricasChart } from './PainelMetricasChart.svelte';
export type { ColunaPainel, LinhaPainel } from './PainelMetricasChart.svelte';
export { default as HalteresChart } from './HalteresChart.svelte';
export type { LinhaHalteres } from './HalteresChart.svelte';
export { default as DispersaoLogChart } from './DispersaoLogChart.svelte';
export type { Isolinha, PontoDispersao } from './DispersaoLogChart.svelte';

// 1.1.1 Dados gerais
export { default as FaixaValorNacionalChart } from './FaixaValorNacionalChart.svelte';
// 1.1.2 Região
export { default as RegiaoPerCapitaChart } from './RegiaoPerCapitaChart.svelte';
export { default as RegiaoContempladosChart } from './RegiaoContempladosChart.svelte';
export { default as RegiaoFaixaChart } from './RegiaoFaixaChart.svelte';
export { default as RegiaoFaixaDistribuicaoChart } from './RegiaoFaixaDistribuicaoChart.svelte';
export { default as RegiaoConsolidadoChart } from './RegiaoConsolidadoChart.svelte';
// 1.1.3 Unidade Federativa
export { default as UfMapaChart } from './UfMapaChart.svelte';
// 1.1.4 Tipo de ente
export { default as EnteChart } from './EnteChart.svelte';
// 1.1.5 Porte dos municípios
export { default as PorteChart } from './PorteChart.svelte';
export { default as CapitaisValorChart } from './CapitaisValorChart.svelte';
export { default as CapitaisPainelChart } from './CapitaisPainelChart.svelte';
export { default as CapitaisDispersaoChart } from './CapitaisDispersaoChart.svelte';
// 1.2.2 Capital, região metropolitana e interior
export { default as ClassificacaoTerritorialChart } from './ClassificacaoTerritorialChart.svelte';
// 1.2.3 REGIC
export { default as RegicChart } from './RegicChart.svelte';
// 1.2.4 Rural e urbano
export { default as RuralUrbanoRegiaoChart } from './RuralUrbanoRegiaoChart.svelte';
export { default as RuralUrbanoTotalChart } from './RuralUrbanoTotalChart.svelte';
// 1.2.5 Territórios especiais
export { default as TerritoriosRegiaoChart } from './TerritoriosRegiaoChart.svelte';
export { default as FavelasUfChart } from './FavelasUfChart.svelte';
export { default as QuilombolasRegiaoChart } from './QuilombolasRegiaoChart.svelte';

export * as coresLpg from './cores';
