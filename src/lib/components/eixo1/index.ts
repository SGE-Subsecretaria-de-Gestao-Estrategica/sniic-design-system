/**
 * Eixo 1 — Gestão e Participação.
 *
 * Portado de `cultura-em-numeros-eixo-1/data-vis`, que segue vivo consumindo
 * `sniic-design-system`. Charts sobre a base `FaixaLinhasChart`, com paleta e
 * tipografia próprias (`cores.ts`, `tokens.ts`) — um sistema de charts
 * autocontido, pensado para exportação em SVG/PNG para impressão em A4,
 * diferente do sistema interativo (`ChartFrame`, `getPillarTheme`) usado pelo
 * Eixo 6. Os demais componentes do repo original (os que não usam
 * `FaixaLinhasChart` como base) ainda não foram portados.
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

// `cores.ts` and `tokens.ts` are internal to this folder's own charts (own
// palette + A4 type scale, distinct from the package's generic `tokens.ts`
// and `getPillarTheme`) — not re-exported at the package root to avoid name
// clashes with those (both define `colors`, `fontSize`, etc).
