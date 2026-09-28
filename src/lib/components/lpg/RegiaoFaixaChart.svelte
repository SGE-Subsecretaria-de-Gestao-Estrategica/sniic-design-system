<script lang="ts">
  /**
   * Figuras 4a e 4b do boletim (G04): contemplados — ou recursos — por região,
   * repartidos nas sete faixas de valor recebido.
   *
   * Colunas empilhadas em valor absoluto — a `ColunaCategoriaChart` do Eixo 1
   * —, das regiões com maior total para as de menor. As faixas empilham da
   * mais baixa (embaixo, mais clara) para a mais alta (em cima, mais escura):
   * a rampa sequencial é o que deixa a ordem das faixas legível sem consulta.
   */
  import ColunaCategoriaChart from '../eixo1/ColunaCategoriaChart.svelte';
  import { coresFaixas } from './cores';
  import { FAIXAS, FAIXAS_CURTAS, FONTE, brlCurto, num } from './formato';
  import { RAIO_BARRA } from './forma';
  import contemplados from './data/04a-regiao-faixa-contemplados.json';
  import valor from './data/04b-regiao-faixa-valor.json';

  let {
    metrica = 'contemplados',
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    /** `contemplados` é a figura 4a; `valor`, a 4b. */
    metrica?: 'contemplados' | 'valor';
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  type Linha = { regiao: string } & Record<string, number | string>;

  const total = (d: Linha) => FAIXAS.reduce((s, f) => s + Number(d[f]), 0);

  const data = $derived(
    ((metrica === 'contemplados' ? contemplados : valor) as Linha[])
      .map((d) => ({ ...d, label: d.regiao }))
      .sort((a, b) => total(b) - total(a)),
  );
</script>

<ColunaCategoriaChart
  radius={RAIO_BARRA}
  {data}
  keys={FAIXAS}
  labels={FAIXAS_CURTAS}
  colors={coresFaixas}
  divisoria
  title={metrica === 'contemplados'
    ? 'Contemplados por faixa de valor e região'
    : 'Recursos por faixa de valor e região'}
  subtitle={metrica === 'contemplados'
    ? 'Número de contemplados em cada faixa de valor recebido'
    : 'Recurso executado em cada faixa de valor recebido (R$)'}
  formatValue={metrica === 'contemplados' ? num : brlCurto}
  source={FONTE}
  {background}
  bind:svgEl
/>
