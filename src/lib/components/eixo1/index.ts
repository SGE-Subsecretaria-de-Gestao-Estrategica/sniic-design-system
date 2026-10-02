/**
 * Eixo 1 — o que sobrou do sistema de impressão depois que as bases saíram.
 *
 * As 18 bases de chart do Eixo 1 deixaram de existir: cada uma tem um gráfico
 * genérico de Cultura em Números que faz o mesmo papel (ver o CHANGELOG), e as
 * quatro que o boletim da LPG usa para impressão — `BarraRankingChart`,
 * `BarraDivergenteChart`, `ColunaCategoriaChart` e `CoropletoUfChart` —
 * mudaram para `../figuras`.
 *
 * Ficam aqui o que essas figuras e os mapas genéricos ainda leem: a escala
 * tipográfica de impressão A4 (`tokens.ts`), o layout de legenda em pastilhas
 * (`legend.ts`), as rampas da marca (`cores.ts`), a malha hexagonal e a das
 * UFs (`mapaUf.ts`, `data/malha-ufs.json`) e o tipo da malha municipal que
 * `MapaMunicipiosChart` recebe por prop. Saem como namespaces (`eixo1Cores`,
 * `eixo1Tokens`) para não colidir com os `colors`/`fontSize` genéricos do
 * pacote.
 */

export type { MalhaMunicipiosProjetada } from './malhaMunicipal';

export * as eixo1Cores from './cores';
export * as eixo1Tokens from './tokens';
export { layoutLegend as eixo1LayoutLegend } from './legend';
export type { LegendItem as Eixo1LegendItem, LegendLayout as Eixo1LegendLayout } from './legend';
