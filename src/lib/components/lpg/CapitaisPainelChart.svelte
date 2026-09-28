<script lang="ts">
  /**
   * As capitais nas três medidas lado a lado: recurso executado, contemplados
   * e valor médio por contemplado — o `PainelMetricasChart`, como a síntese
   * por região da 1.1.2.
   *
   * O mapa (`CapitaisValorChart`) só mostra o total; aqui se vê de que ele é
   * feito, já que total = contemplados × valor médio. Porto Alegre é a capital
   * com mais contemplados e só a 12ª em recurso; Belém tem 2 contemplados e é
   * a 11ª.
   *
   * As linhas vêm ordenadas pelo recurso executado, e cada coluna tem a sua
   * escala. As cores são as da figura de faixas de valor da 1.1.2: roxo nos
   * recursos, azul nos contemplados e o tom do meio da rampa `coresFaixas` no
   * valor médio, que é a razão entre os dois. A coluna do valor médio tem teto:
   * Belém, com R$ 6 mi por contemplado, achataria as outras 26 capitais.
   */
  import PainelMetricasChart from './PainelMetricasChart.svelte';
  import { coresFaixas, corContemplados, corRecursos } from './cores';
  import { FONTE, brlCurto, num } from './formato';
  import dados from './data/15-capitais.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const totalValor = dados.reduce((s, d) => s + d.valor, 0);
  const totalContemplados = dados.reduce((s, d) => s + d.contemplados, 0);
  const mediaValor = totalValor / dados.length;
  const mediaContemplados = totalContemplados / dados.length;
  /** O valor médio do conjunto das capitais, e não a média dos 27 valores médios. */
  const valorMedioCapitais = totalValor / totalContemplados;

  const TETO_VALOR_MEDIO = 250e3;
  const acimaDoTeto = dados.filter((d) => d.valor_medio > TETO_VALOR_MEDIO);

  const colunas = [
    {
      key: 'valor',
      label: 'Recurso executado',
      cor: corRecursos,
      formatValue: brlCurto,
      referencia: { valor: mediaValor, label: `Média ${brlCurto(mediaValor)}` },
    },
    {
      key: 'contemplados',
      label: 'Contemplados',
      cor: corContemplados,
      formatValue: num,
      referencia: { valor: mediaContemplados, label: `Média ${num(mediaContemplados)}` },
    },
    {
      key: 'valor_medio',
      label: 'Valor médio por contemplado',
      cor: coresFaixas[3],
      formatValue: brlCurto,
      referencia: { valor: valorMedioCapitais, label: `Capitais ${brlCurto(valorMedioCapitais)}` },
      teto: TETO_VALOR_MEDIO,
    },
  ];

  const nome = (d: (typeof dados)[number]) => (d.uf === 'DF' ? 'Brasília' : d.capital);

  const linhas = [...dados]
    .sort((a, b) => b.valor - a.valor)
    .map((d) => ({
      key: d.uf,
      label: nome(d),
      valores: { valor: d.valor, contemplados: d.contemplados, valor_medio: d.valor_medio },
    }));

  const notaTeto = acimaDoTeto.length
    ? ` A barra cortada (${acimaDoTeto.map(nome).join(', ')}) passa do fim da escala, R$ ${num(TETO_VALOR_MEDIO / 1e3)} mil.`
    : '';
</script>

<PainelMetricasChart
  {colunas}
  {linhas}
  title="Recurso, contemplados e valor médio nas capitais"
  subtitle="Prefeituras das capitais, pela ordem do recurso executado; cada coluna na sua escala"
  footnote={`Valor médio: recurso executado dividido pelos contemplados. Réguas tracejadas: média das 27 capitais; no valor médio, o conjunto delas.${notaTeto}`}
  source={FONTE}
  {background}
  bind:svgEl
/>
