<script lang="ts">
  /**
   * Figuras 17 e 18 do boletim (G17): recursos — ou contemplados — pela
   * localização do agente cultural: capital, região metropolitana ou interior.
   *
   * Uma barra de composição, em participação no total classificado. Os 220
   * registros sem classificação territorial ficam de fora e a nota o diz.
   */
  import BarraComposicaoChart from './BarraComposicaoChart.svelte';
  import { coresClassificacao } from './cores';
  import { FONTE, pct } from './formato';
  import valor from './data/17-classificacao-territorial-valor.json';
  import contemplados from './data/18-classificacao-territorial-contemplados.json';

  let {
    metrica = 'valor',
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    /** `valor` é a figura 17; `contemplados`, a 18. */
    metrica?: 'valor' | 'contemplados';
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const KEYS = ['Capital', 'Região Metropolitana', 'Interior'];

  const data = $derived.by(() => {
    const rows =
      metrica === 'valor'
        ? valor.map((d) => [d.classificacao, d.pct_valor] as const)
        : contemplados.map((d) => [d.classificacao, d.pct_contemplados] as const);
    return [
      Object.fromEntries([
        ['label', metrica === 'valor' ? 'Recursos' : 'Contemplados'],
        ...rows.filter(([c]) => KEYS.includes(c)),
      ]) as { label: string } & Record<string, number>,
    ];
  });
</script>

<BarraComposicaoChart
  {data}
  keys={KEYS}
  colors={coresClassificacao}
  title={metrica === 'valor'
    ? 'Recursos por capital, região metropolitana e interior'
    : 'Contemplados por capital, região metropolitana e interior'}
  subtitle="Pelo endereço do agente cultural (%)"
  formatValue={pct}
  alturaBarra={34}
  footnote="Exclui 220 registros sem classificação territorial."
  source={FONTE}
  {background}
  bind:svgEl
/>
