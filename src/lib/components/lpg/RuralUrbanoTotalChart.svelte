<script lang="ts">
  /**
   * Figura 24 do boletim (G24): recursos e contemplados em áreas urbanas e
   * rurais, em participação no total nacional.
   *
   * O todo de cada barra é fixo em 100%, e não a soma de urbano e rural: a
   * fração que não pôde ser classificada fica à vista na ponta direita, como a
   * nota explica, em vez de ser redistribuída entre as duas parcelas.
   */
  import BarraComposicaoChart from './BarraComposicaoChart.svelte';
  import { corRural, corUrbano } from './cores';
  import { FONTE, pct } from './formato';
  import dados from './data/24-rural-urbano-total.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const KEYS = ['Urbano', 'Rural'];
  const classificados = dados.filter((d) => KEYS.includes(d.situacao));
  const linha = (rotulo: string, col: 'pct_valor' | 'pct_contemplados') =>
    Object.fromEntries([['label', rotulo], ...classificados.map((d) => [d.situacao, d[col]])]) as {
      label: string;
    } & Record<string, number>;

  const data = [linha('Recursos', 'pct_valor'), linha('Contemplados', 'pct_contemplados')];
</script>

<BarraComposicaoChart
  {data}
  keys={KEYS}
  colors={[corUrbano, corRural]}
  title="Recursos e contemplados em áreas urbanas e rurais"
  subtitle="% do total"
  formatValue={pct}
  total={100}
  footnote="Não somam 100%: 0,15% dos recursos não puderam ser classificados (inclui setores de massas de água)."
  source={FONTE}
  {background}
  bind:svgEl
/>
