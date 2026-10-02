/**
 * O formato da malha municipal projetada que `MapaMunicipiosChart` recebe
 * por prop. A malha (5.570 municípios, ~1,1MB) não vem no pacote: quem
 * consome traz a sua e a passa já resolvida.
 */

import type { Municipio } from '../figuras/CoropletoUfChart.svelte';

export type MalhaMunicipiosProjetada = {
  fonte: string;
  projecao: string;
  largura: number;
  altura: number;
  /** Contagem de municípios por sigla de UF. */
  municipiosPorUf: Record<string, number>;
  municipios: Municipio[];
};
