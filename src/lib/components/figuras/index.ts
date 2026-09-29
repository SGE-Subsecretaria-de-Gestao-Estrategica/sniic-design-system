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
 * Combinam com as bases do Eixo 1 (`BarraRankingChart`,
 * `BarraDivergenteChart`, `ColunaCategoriaChart`, `CoropletoUfChart`…):
 * passe `raio={RAIO_BARRA}` a elas para que os cantos das barras batam.
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
