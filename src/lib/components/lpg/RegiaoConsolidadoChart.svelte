<script lang="ts">
  /**
   * Síntese da seção 1.1.2: as três medidas de recurso por região numa figura
   * só — recurso executado, valor médio por contemplado e valor per capita.
   *
   * No boletim elas estão espalhadas pelas figuras 2 e 3 (e pelo texto), e a
   * leitura que importa só aparece quando estão lado a lado: o Nordeste recebe
   * 30,6% do recurso com o menor valor médio por contemplado, mas é a segunda
   * região em valor por habitante; o Sudeste, o maior volume, é o menor per
   * capita. Cada coluna tem a sua escala e a régua da média nacional.
   */
  import PainelMetricasChart from './PainelMetricasChart.svelte';
  import { corRecursos } from './cores';
  import { FONTE, REGIOES, brl, brlCurto, num, pct } from './formato';
  import perCapita from './data/02-regiao-valor-per-capita.json';
  import contemplados from './data/03-regiao-contemplados-valor-medio.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const milhoes = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const totalValor = perCapita.reduce((s, d) => s + d.valor, 0);
  const totalPopulacao = perCapita.reduce((s, d) => s + d.populacao, 0);
  const totalContemplados = contemplados.reduce((s, d) => s + d.contemplados, 0);
  const valorMedioNacional = totalValor / totalContemplados;
  const perCapitaNacional = totalValor / totalPopulacao;

  const colunas = [
    { key: 'valor', label: 'Recurso executado', cor: corRecursos, formatValue: brlCurto },
    {
      key: 'valor_medio',
      label: 'Valor médio por contemplado',
      cor: corRecursos,
      formatValue: brlCurto,
      referencia: { valor: valorMedioNacional, label: `Brasil ${brlCurto(valorMedioNacional)}` },
    },
    {
      key: 'valor_per_capita',
      label: 'Valor per capita',
      cor: corRecursos,
      formatValue: brl,
      referencia: { valor: perCapitaNacional, label: `Brasil ${brl(perCapitaNacional)}` },
    },
  ];

  const linhas = REGIOES.map((regiao) => {
    const p = perCapita.find((d) => d.regiao === regiao)!;
    const c = contemplados.find((d) => d.regiao === regiao)!;
    return {
      key: regiao,
      label: regiao,
      valores: { valor: p.valor, valor_medio: c.valor_medio, valor_per_capita: p.valor_per_capita },
      detalhes: {
        valor: `${pct(p.pct_valor)} do total`,
        valor_medio: `${num(c.contemplados)} contemplados`,
        valor_per_capita: `${milhoes.format(p.populacao / 1e6)} mi hab.`,
      },
    };
  });
</script>

<PainelMetricasChart
  {colunas}
  {linhas}
  title="Recurso, valor médio e valor per capita por região"
  subtitle="Cada coluna na sua própria escala; a linha tracejada marca a média nacional"
  footnote="Valor médio: recurso executado dividido pelo número de contemplados. População: Censo Demográfico 2022 (IBGE)."
  source={FONTE}
  {background}
  bind:svgEl
/>
