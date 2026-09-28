<script lang="ts">
  /**
   * Figura 14 do boletim (G14): contemplados e valores executados por porte do
   * município, na execução municipal.
   *
   * No app do boletim eram duas pizzas lado a lado; depois, duas barras de
   * composição. As duas deixavam a comparação para o leitor. Aqui cada porte é
   * um haltere — a participação nos contemplados e a participação nos recursos
   * sobre o mesmo eixo —, e o traço entre os pontos é a diferença: as capitais
   * ficam com 4% dos contemplados e 22% dos recursos; os pequenos municípios, o
   * contrário.
   *
   * As cores são as da figura de faixas de valor da 1.1.2
   * (`RegiaoFaixaDistribuicaoChart`): azul nos contemplados, roxo nos recursos,
   * e o traço corre pela mesma rampa `coresFaixas` entre eles. À direita, o
   * valor médio por contemplado — a mesma diferença lida em reais.
   */
  import HalteresChart from './HalteresChart.svelte';
  import { coresFaixas } from './cores';
  import { FONTE, brlCurto, pct } from './formato';
  import dados from './data/14-porte-pizzas.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const linhas = dados.map((d) => ({
    key: d.porte,
    label: d.porte,
    a: d.pct_contemplados,
    b: d.pct_valor,
    extra: brlCurto(d.valor / d.contemplados),
  }));

  const pctEixo = (v: number) => (Number.isInteger(v) ? `${v}%` : pct(v));
</script>

<HalteresChart
  {linhas}
  labelA="Contemplados"
  labelB="Recursos executados"
  corA={coresFaixas[0]}
  corB={coresFaixas[coresFaixas.length - 1]}
  gradiente={coresFaixas}
  title="Contemplados e valores executados por porte de município"
  subtitle="Participação de cada porte no total de contemplados e no total de recursos da execução municipal (%)"
  formatValue={pctEixo}
  extraTitulo="Valor médio por contemplado"
  source={FONTE}
  {background}
  bind:svgEl
/>
