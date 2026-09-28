<script lang="ts">
  /**
   * Figuras 20 e 21 do boletim (G20): contemplados — ou valor executado — por
   * nível da hierarquia urbana da REGIC.
   *
   * A `BarraRankingChart` do Eixo 1, mas na ordem da hierarquia — da maior
   * centralidade para a menor — e não na do valor: a base desenha as linhas na
   * ordem em que chegam, e aqui a ordem é o dado. O app do boletim usava
   * colunas de uma série só pelo mesmo motivo.
   */
  import BarraRankingChart from '../eixo1/BarraRankingChart.svelte';
  import { corContemplados, corRecursos } from './cores';
  import { FONTE, brlCurto, num } from './formato';
  import { RAIO_BARRA } from './forma';
  import contemplados from './data/20-regic-contemplados.json';
  import valor from './data/21-regic-valor.json';

  let {
    metrica = 'contemplados',
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    /** `contemplados` é a figura 20; `valor`, a 21. */
    metrica?: 'contemplados' | 'valor';
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const linhas = $derived(
    metrica === 'contemplados'
      ? contemplados.map((d) => ({ key: d.regic_nivel, label: d.regic_nivel, valor: d.contemplados }))
      : valor.map((d) => ({ key: d.regic_nivel, label: d.regic_nivel, valor: d.valor })),
  );
</script>

<BarraRankingChart
  raio={RAIO_BARRA}
  {linhas}
  cor={metrica === 'contemplados' ? corContemplados : corRecursos}
  title={metrica === 'contemplados'
    ? 'Contemplados por Regiões de Influência das Cidades (REGIC)'
    : 'Valor executado por Regiões de Influência das Cidades (REGIC)'}
  subtitle="Execução municipal, da maior para a menor centralidade"
  formatValue={metrica === 'contemplados' ? num : brlCurto}
  footnote="REGIC 2018 (IBGE). Não inclui os 112 registros do DF, sem classificação."
  source={FONTE}
  {background}
  bind:svgEl
/>
