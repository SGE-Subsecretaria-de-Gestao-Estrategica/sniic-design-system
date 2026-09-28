<script lang="ts">
  /**
   * Figura 23 do boletim (G23): recursos em áreas urbanas e rurais, por região.
   *
   * No app do boletim eram dois gráficos de colunas, cada um na sua escala —
   * o que fazia a parcela rural parecer do tamanho da urbana. Aqui as duas
   * correm em direções opostas na mesma escala — a `BarraDivergenteChart` do
   * Eixo 1 —, e a barra rural curta é o próprio achado: em nenhuma região ela
   * passa de 8% do recurso executado.
   */
  import BarraDivergenteChart from '../eixo1/BarraDivergenteChart.svelte';
  import { corRural, corUrbano } from './cores';
  import { FONTE, brlCurto, pct } from './formato';
  import { RAIO_BARRA } from './forma';
  import dados from './data/23-rural-urbano-por-regiao.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const linhas = dados.map((d) => ({
    key: d.regiao,
    label: d.regiao,
    positivo: d.valor_urbano,
    negativo: d.valor_rural,
  }));

  const maisRural = dados.reduce((a, b) => (b.pct_valor_rural_na_regiao > a.pct_valor_rural_na_regiao ? b : a));
</script>

<BarraDivergenteChart
  raio={RAIO_BARRA}
  {linhas}
  corNegativo={corRural}
  corPositivo={corUrbano}
  labelNegativo="Rural"
  labelPositivo="Urbano"
  title="Distribuição dos recursos entre áreas urbanas e rurais, por região"
  subtitle="Recurso executado, pelo setor censitário do endereço do contemplado"
  formatValue={brlCurto}
  destaque={{
    valor: pct(maisRural.pct_valor_rural_na_regiao),
    cor: corRural,
    texto: `é a parcela rural no ${maisRural.regiao}, a maior entre as regiões`,
  }}
  source={FONTE}
  {background}
  bind:svgEl
/>
