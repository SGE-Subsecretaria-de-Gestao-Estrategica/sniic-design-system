/**
 * Eixo 1 — Gestão e Participação.
 *
 * Portado de `cultura-em-numeros-eixo-1/data-vis`, que segue vivo consumindo
 * `sniic-design-system`. Charts sobre quatro bases — `FaixaLinhasChart`
 * (linhas), `ComposicaoChart` (colunas 100%), `CoropletoUfChart` (mapa real
 * do IBGE por UF) e `HexMapaUfChart` (mapa hexagonal esquemático, mesma
 * malha de `mapaUf.ts` que a base anterior) —, com paleta e tipografia
 * próprias (`cores.ts`, `tokens.ts`) — um sistema de charts autocontido,
 * pensado para exportação em SVG/PNG para impressão em A4, diferente do
 * sistema interativo (`ChartFrame`, `getPillarTheme`) usado pelo Eixo 6.
 * `AgentesPorMunicipioChart` (mosaico municipal, ~1,1MB de geometria) ficou
 * fora de propósito — ver nota no commit. Os demais componentes do repo
 * original ainda não foram portados.
 */

export { default as EquipamentosCulturaisChart } from './EquipamentosCulturaisChart.svelte';
export { default as BibliotecaMunicipalChart } from './BibliotecaMunicipalChart.svelte';
export { default as EstadualFontesChart } from './EstadualFontesChart.svelte';
export { default as GeneroGestoresChart } from './GeneroGestoresChart.svelte';
export { default as IncentivoEstadualChart } from './IncentivoEstadualChart.svelte';
export { default as ParidadeConselhosEstadualChart } from './ParidadeConselhosEstadualChart.svelte';
export { default as ParticipacaoUniaoChart } from './ParticipacaoUniaoChart.svelte';
export { default as PatrimonioEstadualChart } from './PatrimonioEstadualChart.svelte';
export { default as TresEsferasChart } from './TresEsferasChart.svelte';
export { default as TripeEstadualChart } from './TripeEstadualChart.svelte';
export { default as FaixaLinhasChart } from './FaixaLinhasChart.svelte';
export type { Serie as FaixaLinhasSerie, Ponto as FaixaLinhasPonto, Destaque as FaixaLinhasDestaque } from './FaixaLinhasChart.svelte';

export { default as ComposicaoFederalChart } from './ComposicaoFederalChart.svelte';
export { default as ComposicaoMunicipalChart } from './ComposicaoMunicipalChart.svelte';
export { default as EscolaridadeEstadualChart } from './EscolaridadeEstadualChart.svelte';
export { default as OrgaoGestorEstadualChart } from './OrgaoGestorEstadualChart.svelte';
export { default as OrgaoGestorMunicipalChart } from './OrgaoGestorMunicipalChart.svelte';
export { default as RacaGestoresChart } from './RacaGestoresChart.svelte';
export { default as ComposicaoChart } from './ComposicaoChart.svelte';
export type { AnoRow as ComposicaoAnoRow, Span as ComposicaoSpan } from './ComposicaoChart.svelte';

export { default as AgentesTerritoriaisChart } from './AgentesTerritoriaisChart.svelte';
export { default as AutonomiaGestorUfChart } from './AutonomiaGestorUfChart.svelte';
export { default as IncentivoFiscalUfChart } from './IncentivoFiscalUfChart.svelte';
export { default as MaturidadeTripeUfChart } from './MaturidadeTripeUfChart.svelte';
export { default as CoropletoUfChart } from './CoropletoUfChart.svelte';
export type { ValorUf, Municipio as CoropletoMunicipio } from './CoropletoUfChart.svelte';

export { default as ParticipacaoEstadosChart } from './ParticipacaoEstadosChart.svelte';
export { default as TripeUfChart } from './TripeUfChart.svelte';
export { default as HexMapaUfChart } from './HexMapaUfChart.svelte';
export type { ValorUf as HexMapaValorUf } from './HexMapaUfChart.svelte';

export { default as ExecucaoLabMunicipalChart } from './ExecucaoLabMunicipalChart.svelte';
export { default as TransversalidadeEstadualChart } from './TransversalidadeEstadualChart.svelte';
export { default as BarraRankingChart } from './BarraRankingChart.svelte';
export type { LinhaRanking } from './BarraRankingChart.svelte';

export { default as CrescimentoMunicipalChart } from './CrescimentoMunicipalChart.svelte';
export { default as CascataChart } from './CascataChart.svelte';
export type { Bloco as CascataBloco, Destaque as CascataDestaque } from './CascataChart.svelte';

export { default as DistribuicaoRclChart } from './DistribuicaoRclChart.svelte';
export { default as CristasChart } from './CristasChart.svelte';
export type { Crista } from './CristasChart.svelte';

export { default as EscolaridadeInstitucionalizacaoChart } from './EscolaridadeInstitucionalizacaoChart.svelte';
export { default as MatrizBolhasChart } from './MatrizBolhasChart.svelte';
export type { Coluna as MatrizBolhasColuna, Linha as MatrizBolhasLinha } from './MatrizBolhasChart.svelte';

export { default as FederalPorMandatoChart } from './FederalPorMandatoChart.svelte';
export { default as ColunaCategoriaChart } from './ColunaCategoriaChart.svelte';
export type { CategoriaRow } from './ColunaCategoriaChart.svelte';

export { default as HistomapFederalChart } from './HistomapFederalChart.svelte';
export { default as HistomapChart } from './HistomapChart.svelte';
export type {
  AnoRow as HistomapAnoRow,
  Anotacao as HistomapAnotacao,
  DestaqueAno as HistomapDestaqueAno,
} from './HistomapChart.svelte';

export { default as MetaRclChart } from './MetaRclChart.svelte';
export { default as LinhaProporcaoChart } from './LinhaProporcaoChart.svelte';
export type { PontoAbs as LinhaProporcaoPonto } from './LinhaProporcaoChart.svelte';

export { default as MetaRclRegiaoChart } from './MetaRclRegiaoChart.svelte';
export { default as TripeRegiaoMunicipalChart } from './TripeRegiaoMunicipalChart.svelte';
export { default as PequenosMultiplosChart } from './PequenosMultiplosChart.svelte';
export type { PainelSerie } from './PequenosMultiplosChart.svelte';

// `cores.ts` and `tokens.ts` are internal to this folder's own charts (own
// palette + A4 type scale, distinct from the package's generic `tokens.ts`
// and `getPillarTheme`) — not re-exported at the package root to avoid name
// clashes with those (both define `colors`, `fontSize`, etc).
