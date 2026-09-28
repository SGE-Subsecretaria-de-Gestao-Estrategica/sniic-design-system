<script lang="ts">
  /**
   * Figura 27 do boletim (G27): contemplados em favelas e comunidades urbanas,
   * por UF — a `BarraRankingChart` do Eixo 1.
   */
  import BarraRankingChart from '../eixo1/BarraRankingChart.svelte';
  import { corFavelas } from './cores';
  import { FONTE, num, pct } from './formato';
  import { RAIO_BARRA } from './forma';
  import dados from './data/27-favelas-por-uf.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const linhas = [...dados]
    .sort((a, b) => b.contemplados - a.contemplados)
    .map((d) => ({ key: d.uf, label: d.uf, valor: d.contemplados }));

  const top5 = linhas.slice(0, 5);
  const pctTop5 = dados
    .filter((d) => top5.some((l) => l.key === d.uf))
    .reduce((s, d) => s + d.pct_contemplados, 0);
</script>

<BarraRankingChart
  raio={RAIO_BARRA}
  {linhas}
  cor={corFavelas}
  title="Contemplados em favelas e comunidades urbanas por UF"
  subtitle="Número de contemplados com endereço em favelas e comunidades urbanas"
  formatValue={num}
  alturaBarra={13}
  destaque={{
    valor: pct(pctTop5),
    cor: corFavelas,
    texto: `estão em ${top5.map((l) => l.key).join(', ')}`,
  }}
  source={FONTE}
  {background}
  bind:svgEl
/>
