<script lang="ts">
  /**
   * Figura 15 do boletim (G15): recursos executados pelas prefeituras das
   * capitais.
   *
   * Era um ranking em barras, com 27 nomes de cidade para ler um a um. Aqui é
   * o coroplético por classes do Eixo 1 (`CoropletoUfChart`): cada UF recebe a
   * cor do valor executado pela sua capital, o que deixa à vista o que o
   * ranking escondia — o peso do Sudeste e o degrau entre São Paulo e todas as
   * outras. Na rampa roxa dos recursos, a mesma de `UfMapaChart`.
   *
   * As quebras são redondas e escolhidas para que nenhuma classe fique vazia
   * nem concentre mais de um terço das capitais.
   */
  import CoropletoUfChart from '../eixo1/CoropletoUfChart.svelte';
  import { rampaRecursos } from './cores';
  import { FONTE, brlCurto, pct } from './formato';
  import dados from './data/15-capitais.json';
  import coordenadas from './data/capitais-coordenadas.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const valores = dados.map((d) => ({ uf: d.uf, valor: d.valor }));

  /** O nome da capital no lugar da sigla; no DF, a cidade, e não a unidade. */
  const nomes = Object.fromEntries(
    dados.map((d) => [d.uf, d.uf === 'DF' ? 'Brasília' : d.capital]),
  );
  /** A sede de cada capital, em `[longitude, latitude]`. */
  const pontos = Object.fromEntries(
    Object.entries(coordenadas).map(([uf, [lon, lat]]) => [uf, [lon, lat] as [number, number]]),
  );

  const total = dados.reduce((s, d) => s + d.valor, 0);
  const spRj = dados
    .filter((d) => d.uf === 'SP' || d.uf === 'RJ')
    .reduce((s, d) => s + d.valor, 0);
</script>

<CoropletoUfChart
  {valores}
  rampa={rampaRecursos}
  quebras={[5e6, 10e6, 15e6, 25e6]}
  rotulosClasses={['Até R$ 5 mi', 'R$ 5–10 mi', 'R$ 10–15 mi', 'R$ 15–25 mi', 'Acima de R$ 25 mi']}
  legendaTitulo="Recurso executado pela capital (R$):"
  formatValue={(v) => brlCurto(v).replace('R$ ', '')}
  title="Recursos executados pelas capitais"
  subtitle="Execução municipal das prefeituras das capitais, por Unidade Federativa"
  destaque={{
    valor: pct((spRj / total) * 100),
    cor: rampaRecursos[3],
    texto: 'dos recursos das capitais ficaram em São Paulo e Rio de Janeiro',
  }}
  rotulosAbaixo={['AC', 'RO']}
  rotulosEsquerda={['RR', 'MS']}
  {nomes}
  {pontos}
  footnote="A cor preenche a UF inteira, mas o valor é só o executado pela prefeitura da capital (no Distrito Federal, pelo governo distrital)."
  source={FONTE}
  {background}
  bind:svgEl
/>
