<script lang="ts">
  /**
   * Figura 28 do boletim (G28): contemplados nos agrupamentos quilombolas, por
   * região — a `BarraRankingChart` do Eixo 1.
   */
  import BarraRankingChart from '../eixo1/BarraRankingChart.svelte';
  import { corQuilombolas } from './cores';
  import { FONTE, pct } from './formato';
  import { RAIO_BARRA } from './forma';
  import dados from './data/28-quilombolas-por-regiao.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const linhas = [...dados]
    .sort((a, b) => b.pct_contemplados - a.pct_contemplados)
    .map((d) => ({ key: d.regiao, label: d.regiao, valor: d.pct_contemplados }));
</script>

<BarraRankingChart
  raio={RAIO_BARRA}
  {linhas}
  cor={corQuilombolas}
  title="Contemplados nos agrupamentos quilombolas por região"
  subtitle="% dos contemplados em agrupamentos quilombolas"
  formatValue={pct}
  source={FONTE}
  {background}
  bind:svgEl
/>
