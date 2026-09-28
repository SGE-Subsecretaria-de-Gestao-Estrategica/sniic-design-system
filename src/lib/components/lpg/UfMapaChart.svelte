<script lang="ts">
  /**
   * Figuras 5 e 6 do boletim (G05): recurso executado — ou contemplados — por
   * unidade federativa, somando a execução de estados e municípios.
   *
   * O coroplético por classes do Eixo 1 (`CoropletoUfChart`), sobre a malha do
   * IBGE, em cinco degraus das rampas da PNAB: roxo para recursos, azul para
   * contemplados — o par de cores da figura 1.1.1. As
   * quebras são redondas e escolhidas para que nenhuma classe fique vazia nem
   * concentre mais de um terço dos estados.
   */
  import CoropletoUfChart from '../eixo1/CoropletoUfChart.svelte';
  import { rampaContemplados, rampaRecursos } from './cores';
  import { FONTE, brlCurto, num, pct } from './formato';
  import dados from './data/05-uf-mapa-valor.json';

  let {
    metrica = 'valor',
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    /** `valor` é a figura 5; `contemplados`, a 6. */
    metrica?: 'valor' | 'contemplados';
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const spMg = dados
    .filter((d) => d.uf === 'SP' || d.uf === 'MG')
    .reduce((s, d) => ({ valor: s.valor + d.pct_valor, contemplados: s.contemplados + d.pct_contemplados }), {
      valor: 0,
      contemplados: 0,
    });

  const cfg = $derived(
    metrica === 'valor'
      ? {
          title: 'Recurso executado por UF',
          // Sem o "R$" dentro do mapa: com ele, quase nenhum estado comporta o
          // próprio número e os rótulos migram todos para a calha lateral.
          legendaTitulo: 'Recurso executado (R$):',
          rampa: rampaRecursos,
          quebras: [50e6, 100e6, 200e6, 300e6],
          rotulosClasses: ['Até R$ 50 mi', 'R$ 50–100 mi', 'R$ 100–200 mi', 'R$ 200–300 mi', 'Acima de R$ 300 mi'],
          formatValue: (v: number) => brlCurto(v).replace('R$ ', ''),
          destaque: pct(spMg.valor),
        }
      : {
          title: 'Contemplados por UF',
          legendaTitulo: 'Contemplados:',
          rampa: rampaContemplados,
          quebras: [2000, 5000, 10000, 20000],
          rotulosClasses: ['Até 2 mil', '2–5 mil', '5–10 mil', '10–20 mil', 'Acima de 20 mil'],
          formatValue: num,
          destaque: pct(spMg.contemplados),
        },
  );

  const valores = $derived(dados.map((d) => ({ uf: d.uf, valor: d[metrica] })));
</script>

<CoropletoUfChart
  {valores}
  rampa={cfg.rampa}
  quebras={cfg.quebras}
  rotulosClasses={cfg.rotulosClasses}
  legendaTitulo={cfg.legendaTitulo}
  formatValue={cfg.formatValue}
  title={cfg.title}
  subtitle="Execução de estados e municípios somada por Unidade Federativa"
  destaque={{
    valor: cfg.destaque,
    cor: cfg.rampa[3],
    texto: metrica === 'valor' ? 'dos recursos ficaram em SP e MG' : 'dos contemplados estão em SP e MG',
  }}
  rotulosAbaixo={['AC']}
  source={FONTE}
  {background}
  bind:svgEl
/>
