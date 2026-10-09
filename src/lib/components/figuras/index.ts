/**
 * Figuras — bases de gráfico no idioma de Cultura em Números: cartão SVG
 * autocontido, com título, subtítulo, legenda em pastilhas, nota e fonte
 * desenhados dentro do `<svg>`, na escala de impressão A4 do Eixo 1
 * (`../eixo1/tokens`).
 *
 * Nasceram para o boletim da LPG, que hoje vive no próprio repositório
 * (`LPG-2026/data-viz`) e consome estas bases pelo pacote. Nenhuma delas
 * conhece dados, textos ou paleta de projeto: tudo entra por prop — inclusive
 * `corTexto`, o tom do texto escuro (por omissão, o quase preto do Eixo 1).
 *
 * `BarraRankingChart`, `BarraDivergenteChart`, `ColunaCategoriaChart` e
 * `CoropletoUfChart` vieram das bases do Eixo 1, que deixaram de existir —
 * os gráficos genéricos de Cultura em Números cobrem o mesmo papel. Estas
 * quatro ficaram porque o boletim da LPG as usa para impressão; passe
 * `raio={RAIO_BARRA}` a elas para que os cantos das barras batam.
 */

export { default as BarraComposicaoChart } from './BarraComposicaoChart.svelte';
export type { LinhaComposicao } from './BarraComposicaoChart.svelte';
export { default as MosaicoChart } from './MosaicoChart.svelte';
export type { PecaMosaico } from './MosaicoChart.svelte';
export { default as FluxoComposicaoChart } from './FluxoComposicaoChart.svelte';
export type { BarraFluxo, CategoriaFluxo, NotaFluxo } from './FluxoComposicaoChart.svelte';
export { default as PainelMetricasChart } from './PainelMetricasChart.svelte';
export type { ColunaPainel, LinhaPainel } from './PainelMetricasChart.svelte';
export { default as HalteresChart } from './HalteresChart.svelte';
export type { LinhaHalteres } from './HalteresChart.svelte';
export { default as DispersaoLogChart } from './DispersaoLogChart.svelte';
export type { AnotacaoDispersao, Isolinha, PontoDispersao } from './DispersaoLogChart.svelte';
export { default as Destaque, DESTAQUE, alturaDestaque, larguraValorDestaque, linhasDestaque } from './Destaque.svelte';

export { RAIO_BARRA, segmentoPath } from './forma';

export { default as BarraRankingChart } from './BarraRankingChart.svelte';
export type { LinhaRanking } from './BarraRankingChart.svelte';
export { default as BarraDivergenteChart } from './BarraDivergenteChart.svelte';
export type { LinhaDivergente } from './BarraDivergenteChart.svelte';
export { default as ColunaCategoriaChart } from './ColunaCategoriaChart.svelte';
export type { CategoriaRow } from './ColunaCategoriaChart.svelte';
export { default as CoropletoUfChart } from './CoropletoUfChart.svelte';
export type { ValorUf, Municipio as CoropletoMunicipio } from './CoropletoUfChart.svelte';
