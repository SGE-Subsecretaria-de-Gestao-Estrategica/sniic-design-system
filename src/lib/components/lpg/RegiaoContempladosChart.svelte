<script lang="ts">
  /**
   * Figura 3 do boletim (G03): contemplados por região, com o valor médio por
   * contemplado.
   *
   * A área de cada peça do mosaico mede os contemplados; a segunda linha do
   * rótulo diz o valor médio. O Nordeste, a maior peça, é também a de menor
   * valor médio — as duas medidas lidas juntas, sem segunda escala.
   */
  import MosaicoChart from './MosaicoChart.svelte';
  import { coresRegioes } from './cores';
  import { FONTE, REGIOES, brlCurto, num } from './formato';
  import dados from './data/03-regiao-contemplados-valor-medio.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const pecas = dados.map((d) => ({
    key: d.regiao,
    label: d.regiao,
    valor: d.contemplados,
    cor: coresRegioes[REGIOES.indexOf(d.regiao)],
    detalhe: `${num(d.contemplados)} · média ${brlCurto(d.valor_medio)}`,
  }));
</script>

<MosaicoChart
  {pecas}
  title="Distribuição dos contemplados e valor médio por região"
  subtitle="Área proporcional ao número de contemplados; no rótulo, contemplados e valor médio por contemplado"
  source={FONTE}
  {background}
  bind:svgEl
/>
