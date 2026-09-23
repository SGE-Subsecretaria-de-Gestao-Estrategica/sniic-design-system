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

// `cores.ts` and `tokens.ts` are internal to this folder's own charts (own
// palette + A4 type scale, distinct from the package's generic `tokens.ts`
// and `getPillarTheme`) — not re-exported at the package root to avoid name
// clashes with those (both define `colors`, `fontSize`, etc).
