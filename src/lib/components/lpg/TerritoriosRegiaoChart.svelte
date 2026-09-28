<script lang="ts">
  /**
   * Figura 25 do boletim (G25): de que região saiu o recurso de cada tipo de
   * território especial — favelas, agrupamentos indígenas e quilombolas.
   *
   * No app do boletim eram colunas 100% empilhadas. Deitadas, as barras dão
   * lugar aos nomes longos dos territórios sem quebrá-los sob a coluna, e as
   * regiões mantêm a mesma ordem e as mesmas cores das demais figuras.
   */
  import BarraComposicaoChart from './BarraComposicaoChart.svelte';
  import { coresRegioes } from './cores';
  import { FONTE, REGIOES, pct } from './formato';
  import dados from './data/25-territorios-especiais-regiao-pct-valor.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const data = dados.map((d) => ({ ...d, label: d.territorio }));
</script>

<BarraComposicaoChart
  {data}
  keys={REGIOES}
  colors={coresRegioes}
  title="Distribuição dos recursos nos territórios especiais por região"
  subtitle="% do valor de cada tipo de território"
  formatValue={pct}
  source={FONTE}
  {background}
  bind:svgEl
/>
