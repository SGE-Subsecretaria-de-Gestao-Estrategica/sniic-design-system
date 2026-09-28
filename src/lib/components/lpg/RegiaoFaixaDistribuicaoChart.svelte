<script lang="ts">
  /**
   * Distribuição dos recursos e dos contemplados por faixa de valor recebido,
   * em cada região — as figuras 4a e 4b lidas juntas.
   *
   * Um par de barras de composição por região: em cima, como os contemplados
   * se repartem nas sete faixas; embaixo, como o recurso se reparte. A rampa
   * sequencial deixa a inversão à vista sem legenda: nos contemplados a massa
   * está à esquerda (as faixas claras, até R$ 10 mil), no recurso ela corre
   * para a direita (as escuras). No Norte, 0,4% dos contemplados — os que
   * receberam acima de R$ 1 milhão — ficam com 30,6% do recurso.
   *
   * Em participação no total da região, não em valor absoluto: o que se
   * compara é a forma da repartição, e as absolutas já estão em
   * `RegiaoFaixaChart`. Os valores que não cabem no segmento ficam de fora.
   */
  import BarraComposicaoChart from './BarraComposicaoChart.svelte';
  import { coresFaixas } from './cores';
  import { FAIXAS, FAIXAS_CURTAS, FONTE, REGIOES } from './formato';
  import contemplados from './data/04a-regiao-faixa-contemplados.json';
  import valor from './data/04b-regiao-faixa-valor.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  type Linha = { regiao: string } & Record<string, number | string>;

  /** Cada faixa como participação (0–100) no total da região. */
  const participacao = (d: Linha) => {
    const total = FAIXAS.reduce((s, f) => s + Number(d[f]), 0);
    return Object.fromEntries(FAIXAS.map((f) => [f, (Number(d[f]) / total) * 100]));
  };

  const data = REGIOES.flatMap((regiao) => {
    const c = (contemplados as Linha[]).find((d) => d.regiao === regiao)!;
    const v = (valor as Linha[]).find((d) => d.regiao === regiao)!;
    return [
      { grupo: regiao, label: 'Contemplados', ...participacao(c) },
      { grupo: regiao, label: 'Recursos', ...participacao(v) },
    ];
  });

  const pctInteiro = (v: number) => `${Math.round(v)}%`;
</script>

<BarraComposicaoChart
  {data}
  keys={FAIXAS}
  labels={FAIXAS_CURTAS}
  colors={coresFaixas}
  title="Distribuição dos recursos e dos contemplados por faixa de valor recebido, por região"
  subtitle="Participação de cada faixa no total de contemplados e no total de recursos da região (%)"
  formatValue={pctInteiro}
  rotulosFora={false}
  divisoria
  alturaBarra={20}
  footnote="Segmentos estreitos demais para o número ficam sem rótulo."
  source={FONTE}
  {background}
  bind:svgEl
/>
