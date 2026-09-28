<script lang="ts">
  /**
   * Figura 1 do boletim (G01): contemplados e recursos por faixa de valor
   * recebido, em participação no total nacional.
   *
   * No app do boletim eram colunas agrupadas. Aqui as duas parcelas correm em
   * direções opostas a partir do mesmo zero, na mesma escala — a
   * `BarraDivergenteChart` do Eixo 1 —, e o desencontro entre as duas vira o
   * desenho: as faixas de baixo concentram as pessoas, as de cima o dinheiro.
   */
  import BarraDivergenteChart from '../eixo1/BarraDivergenteChart.svelte';
  import { corContemplados, corRecursos } from './cores';
  import { FONTE, num, pct } from './formato';
  import { RAIO_BARRA } from './forma';
  import dados from './data/01-faixa-valor-nacional.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const linhas = dados.map((d) => ({
    key: d.faixa,
    label: d.faixa,
    positivo: d.pct_valor,
    negativo: d.pct_contemplados,
  }));

  const ate10mil = dados
    .filter((d) => d.faixa === 'Até 2 mil' || d.faixa === '2 a 10 mil')
    .reduce((s, d) => s + d.pct_contemplados, 0);

  // O topo da distribuição: as faixas a partir de R$ 200 mil.
  const topo = dados.filter((d) =>
    ['200 a 500 mil', '500 mil a 1 milhão', 'Acima de 1 milhão'].includes(d.faixa),
  );
  const topoContemplados = topo.reduce((s, d) => s + d.pct_contemplados, 0);
  const topoRecursos = topo.reduce((s, d) => s + d.pct_valor, 0);
</script>

<BarraDivergenteChart
  raio={RAIO_BARRA}
  legenda="nomes"
  {linhas}
  corNegativo={corContemplados}
  corPositivo={corRecursos}
  labelNegativo="Contemplados"
  labelPositivo="Recursos"
  title="Contemplados e recursos por faixa de valor"
  subtitle="Participação de cada faixa de valor recebido no total de contemplados e de recursos (%)"
  formatValue={pct}
  destaque={[
    {
      valor: pct(ate10mil),
      cor: corContemplados,
      texto: 'dos contemplados receberam até R$ 10 mil',
    },
    {
      valor: `${num(topoContemplados)}%`,
      cor: corContemplados,
      texto: `dos contemplados recebeu ${pct(topoRecursos)} dos recursos`,
    },
  ]}
  source={FONTE}
  {background}
  bind:svgEl
/>
