/**
 * Eixo 1 — Gestão e Participação.
 *
 * Só as bases de chart, sem dados nem textos: FaixaLinhasChart,
 * ComposicaoChart, CoropletoUfChart, HexMapaUfChart, BarraRankingChart,
 * CascataChart, CristasChart, MatrizBolhasChart, ColunaCategoriaChart,
 * HistomapChart, LinhaProporcaoChart, PequenosMultiplosChart,
 * MatrizPontosChart, AntesDepoisChart, ConcentracaoChart,
 * BarraDivergenteChart, RibbonChart (exportado como `Eixo1RibbonChart`) e
 * MosaicoMunicipalChart. Tudo entra por prop; as figuras prontas — com os
 * dados e os textos da publicação — vivem em `cultura-em-numeros-eixo-1/data-vis`,
 * que compõe estas bases.
 *
 * Paleta e tipografia próprias (`cores.ts`, `tokens.ts`), pensadas para
 * exportação em SVG/PNG para impressão em A4 — diferente do sistema
 * interativo (`ChartFrame`, `getPillarTheme`) usado pelo Eixo 6. Saem como
 * namespaces (`eixo1Cores`, `eixo1Tokens`) para quem monta figuras sobre as
 * bases usar a mesma paleta e escala, sem colidir com os `colors`/`fontSize`
 * genéricos do pacote.
 *
 * A malha das UFs (`data/malha-ufs.json`, 64KB) segue embutida porque
 * `CoropletoUfChart` e `MosaicoMunicipalChart` a desenham sozinhos; a malha
 * municipal (1,1MB) entra por prop em `MosaicoMunicipalChart` — quem consome
 * traz a sua.
 */

export { default as FaixaLinhasChart } from './FaixaLinhasChart.svelte';
export type { Serie as FaixaLinhasSerie, Ponto as FaixaLinhasPonto, Destaque as FaixaLinhasDestaque } from './FaixaLinhasChart.svelte';

export { default as ComposicaoChart } from './ComposicaoChart.svelte';
export type { AnoRow as ComposicaoAnoRow, Span as ComposicaoSpan } from './ComposicaoChart.svelte';

export { default as CoropletoUfChart } from './CoropletoUfChart.svelte';
export type { ValorUf, Municipio as CoropletoMunicipio } from './CoropletoUfChart.svelte';

export { default as HexMapaUfChart } from './HexMapaUfChart.svelte';
export type { ValorUf as HexMapaValorUf } from './HexMapaUfChart.svelte';

export { default as BarraRankingChart } from './BarraRankingChart.svelte';
export type { LinhaRanking } from './BarraRankingChart.svelte';

export { default as CascataChart } from './CascataChart.svelte';
export type { Bloco as CascataBloco, Destaque as CascataDestaque } from './CascataChart.svelte';

export { default as CristasChart } from './CristasChart.svelte';
export type { Crista } from './CristasChart.svelte';

export { default as MatrizBolhasChart } from './MatrizBolhasChart.svelte';
export type { Coluna as MatrizBolhasColuna, Linha as MatrizBolhasLinha } from './MatrizBolhasChart.svelte';

export { default as ColunaCategoriaChart } from './ColunaCategoriaChart.svelte';
export type { CategoriaRow } from './ColunaCategoriaChart.svelte';

export { default as HistomapChart } from './HistomapChart.svelte';
export type {
  AnoRow as HistomapAnoRow,
  Anotacao as HistomapAnotacao,
  DestaqueAno as HistomapDestaqueAno,
} from './HistomapChart.svelte';

export { default as LinhaProporcaoChart } from './LinhaProporcaoChart.svelte';
export type { PontoAbs as LinhaProporcaoPonto } from './LinhaProporcaoChart.svelte';

export { default as PequenosMultiplosChart } from './PequenosMultiplosChart.svelte';
export type { PainelSerie } from './PequenosMultiplosChart.svelte';

export { default as MatrizPontosChart } from './MatrizPontosChart.svelte';
export type { Fatia as MatrizPontosFatia, Painel as MatrizPontosPainel } from './MatrizPontosChart.svelte';

export { default as AntesDepoisChart } from './AntesDepoisChart.svelte';
export type { LinhaAntesDepois } from './AntesDepoisChart.svelte';

export { default as ConcentracaoChart } from './ConcentracaoChart.svelte';
export type { PontoLorenz, Marco } from './ConcentracaoChart.svelte';

export { default as BarraDivergenteChart } from './BarraDivergenteChart.svelte';
export type { LinhaDivergente } from './BarraDivergenteChart.svelte';

// Aliased: the package root already exports a generic, interactive `RibbonChart`
// (`./components/RibbonChart.svelte`) — this is Eixo 1's own print-oriented base.
export { default as Eixo1RibbonChart } from './RibbonChart.svelte';
export type { ColunaRow as Eixo1RibbonColunaRow, Periodo as Eixo1RibbonPeriodo } from './RibbonChart.svelte';

export { default as MosaicoMunicipalChart } from './MosaicoMunicipalChart.svelte';
export type { MalhaMunicipiosProjetada } from './malhaMunicipal';

export * as eixo1Cores from './cores';
export * as eixo1Tokens from './tokens';
export { layoutLegend as eixo1LayoutLegend } from './legend';
export type { LegendItem as Eixo1LegendItem, LegendLayout as Eixo1LegendLayout } from './legend';
