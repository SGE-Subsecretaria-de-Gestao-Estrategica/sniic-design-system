<script lang="ts">
  /**
   * As capitais por contemplados e valor médio por contemplado, os dois eixos
   * em escala log — a `DispersaoLogChart`.
   *
   * O recurso total é o produto dos dois, e em escala log o produto constante
   * é uma diagonal: capitais na mesma faixa diagonal executaram um recurso
   * parecido por caminhos opostos. Porto Alegre (917 contemplados, R$ 13 mil cada) e Belém
   * (2 contemplados, R$ 6 mi cada) chegam ambas a R$ 12 mi.
   *
   * O domínio cobre as outras 26 capitais; Belém fica presa ao canto, com a
   * seta de fora da escala e os valores escritos no rótulo. Os pontos são
   * anéis quase pretos, sem preenchimento: a cor fica toda com as faixas de
   * total, que aparecem através deles.
   */
  import DispersaoLogChart from './DispersaoLogChart.svelte';
  import { coresFaixasTotal, corRotuloFaixaTotal } from './cores';
  import { FONTE, brlCurto, num } from './formato';
  import dados from './data/15-capitais.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const nome = (d: (typeof dados)[number]) => (d.uf === 'DF' ? 'Brasília' : d.capital);

  const pontos = dados.map((d) => ({
    key: d.uf,
    label: nome(d),
    x: d.contemplados,
    y: d.valor_medio,
    detalhe: `${num(d.contemplados)} contemplados · ${brlCurto(d.valor_medio)} cada`,
  }));

  // Quatro bordas, cinco faixas: até R$ 5 mi, 5–10, 10–25, 25–50 e acima de 50.
  const isolinhas = [5e6, 10e6, 25e6, 50e6].map((valor) => ({
    valor,
    label: brlCurto(valor).replace(',0', ''),
  }));

  const milReais = (v: number) => (v >= 1e6 ? brlCurto(v) : `R$ ${num(v / 1e3)} mil`);
</script>

<DispersaoLogChart
  {pontos}
  dominioX={[50, 1000]}
  dominioY={[10e3, 250e3]}
  tituloX="Contemplados →"
  tituloY="↑ Valor médio por contemplado"
  formatX={num}
  formatY={milReais}
  {isolinhas}
  cor="#1F1F1C"
  coresFaixas={coresFaixasTotal(isolinhas.length + 1)}
  corRotuloFaixa={corRotuloFaixaTotal}
  title="Contemplados e valor médio por contemplado nas capitais"
  subtitle="Prefeituras das capitais. Quanto mais escura a faixa, maior o recurso total executado"
  footnote="Eixos em escala logarítmica. Belém está fora da escala nos dois eixos: o ponto fica preso ao canto, com os valores reais no rótulo."
  source={FONTE}
  {background}
  bind:svgEl
/>
