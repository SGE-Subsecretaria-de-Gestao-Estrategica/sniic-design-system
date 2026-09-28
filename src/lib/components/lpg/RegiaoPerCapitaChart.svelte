<script lang="ts">
  /**
   * Figura 2 do boletim (G02): recurso executado por habitante, por região.
   *
   * No app do boletim eram as silhuetas das regiões. Aqui é um ranking — a
   * `BarraRankingChart` do Eixo 1 —, do maior para o menor valor per capita,
   * com a média nacional no destaque ao lado, que é a régua contra a qual cada
   * região se lê.
   */
  import BarraRankingChart from '../eixo1/BarraRankingChart.svelte';
  import { corRecursos } from './cores';
  import { FONTE, brl } from './formato';
  import { RAIO_BARRA } from './forma';
  import dados from './data/02-regiao-valor-per-capita.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const linhas = [...dados]
    .sort((a, b) => b.valor_per_capita - a.valor_per_capita)
    .map((d) => ({ key: d.regiao, label: d.regiao, valor: d.valor_per_capita }));

  const mediaNacional =
    dados.reduce((s, d) => s + d.valor, 0) / dados.reduce((s, d) => s + d.populacao, 0);
</script>

<BarraRankingChart
  raio={RAIO_BARRA}
  {linhas}
  cor={corRecursos}
  title="Valor per capita distribuído por região"
  subtitle="Recurso executado por habitante (R$)"
  formatValue={brl}
  destaque={{ valor: brl(mediaNacional), cor: corRecursos, texto: 'é a média nacional por habitante' }}
  footnote="População: Censo Demográfico 2022 (IBGE)."
  source={FONTE}
  {background}
  bind:svgEl
/>
