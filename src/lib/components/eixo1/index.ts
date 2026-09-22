/**
 * Eixo 1 — Gestão e Participação.
 *
 * Portado de `cultura-em-numeros-eixo-1/data-vis`, que segue vivo consumindo
 * `sniic-design-system`. Esta é a primeira fatia migrada (uma prova de
 * conceito): `EquipamentosCulturaisChart` sobre a base `FaixaLinhasChart`,
 * com paleta e tipografia próprias (`cores.ts`, `tokens.ts`) — um sistema de
 * charts autocontido, pensado para exportação em SVG/PNG para impressão em
 * A4, diferente do sistema interativo (`ChartFrame`, `getPillarTheme`) usado
 * pelo Eixo 6. Os outros ~60 componentes do repo original ainda não foram
 * portados.
 */

export { default as EquipamentosCulturaisChart } from './EquipamentosCulturaisChart.svelte';
export { default as FaixaLinhasChart } from './FaixaLinhasChart.svelte';
export type { Serie as FaixaLinhasSerie, Ponto as FaixaLinhasPonto, Destaque as FaixaLinhasDestaque } from './FaixaLinhasChart.svelte';

// `cores.ts` and `tokens.ts` are internal to this folder's own charts (own
// palette + A4 type scale, distinct from the package's generic `tokens.ts`
// and `getPillarTheme`) — not re-exported at the package root to avoid name
// clashes with those (both define `colors`, `fontSize`, etc).
