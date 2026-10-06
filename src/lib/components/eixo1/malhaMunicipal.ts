/**
 * A malha municipal projetada e o gabarito de institucionalização municipal
 * de 2021 — os dois datasets granulares (5.570 municípios) do Eixo 1.
 *
 * Ao contrário dos demais dados do Eixo 1 (todos estatísticos por UF/ano,
 * poucos KB, e por isso importados estaticamente), estes dois são grandes o
 * bastante — 1,1MB e 160KB — para inflar o bundle de qualquer consumidor do
 * pacote, mesmo quem nunca usa `AgentesPorMunicipioChart` ou
 * `MosaicoInstitucionalizacaoMunicipalChart`: o build da lib é um arquivo só
 * (`vite.config.ts`, sem `preserveModules`), então um import estático aqui
 * entraria no bundle de todo mundo. Por isso vivem em `public/data/eixo1/` e
 * são buscados em runtime, no mesmo padrão que `eixo6/data.ts` já usa para
 * os CSVs grandes: os componentes (`AgentesPorMunicipioChart`,
 * `MosaicoInstitucionalizacaoMunicipalChart`) recebem os dados já resolvidos
 * por prop — não buscam sozinhos — e quem os consome (a story, ou um host)
 * chama `onMount` + `$state`, guardado por `{#if}`, com estes loaders.
 */

import type { Municipio } from './CoropletoUfChart.svelte';

export type MalhaMunicipiosProjetada = {
  fonte: string;
  projecao: string;
  largura: number;
  altura: number;
  /** Contagem de municípios por sigla de UF. */
  municipiosPorUf: Record<string, number>;
  municipios: Municipio[];
};

export async function loadMalhaMunicipiosProjetada(
  url = '/data/eixo1/malha-municipios-projetada.json',
): Promise<MalhaMunicipiosProjetada> {
  const res = await fetch(url);
  return res.json();
}

export type GestaoMunicipioInstitucionalizacao = {
  /** Número de instrumentos do tripé do SNC ativos — conselho, fundo e plano —, de 0 a 3. */
  t: number;
};

export type GestaoMunicipios2021 = {
  ano: number;
  municipios: Record<string, GestaoMunicipioInstitucionalizacao>;
};

export async function loadGestaoMunicipios2021(
  url = '/data/eixo1/gestao-municipios-2021.json',
): Promise<GestaoMunicipios2021> {
  const res = await fetch(url);
  return res.json();
}
