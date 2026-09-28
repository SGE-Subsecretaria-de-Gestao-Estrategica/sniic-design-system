<script lang="ts">
  /**
   * Figuras 8 e 9 do boletim (G08), numa só: como estados e municípios dividem
   * os contemplados e como dividem os recursos da LPG.
   *
   * As duas repartições uma sobre a outra, ligadas ente a ente
   * (`FluxoComposicaoChart`). A faixa dos estados abre de 11,6% dos
   * contemplados para 52,5% dos recursos; a dos municípios fecha de 88,4% para
   * 47,5%. O valor médio por contemplado, sob cada ente, diz a mesma coisa em
   * número: o estado pagou por agente cerca de oito vezes o que pagou o
   * município.
   *
   * As cores são as da figura 1.1.1 — azul para contemplados, roxo para
   * recursos.
   */
  import FluxoComposicaoChart, { type BarraFluxo } from './FluxoComposicaoChart.svelte';
  import { corContemplados, corRecursos } from './cores';
  import { FONTE, brlCurto, num, pct } from './formato';
  import valor from './data/08-ente-valor.json';
  import contemplados from './data/09-ente-contemplados.json';

  let {
    svgEl = $bindable(null),
    background = '#ffffff',
  }: {
    svgEl?: SVGSVGElement | null;
    background?: string | null;
  } = $props();

  const ENTES = ['Estado', 'Município'];

  const porEnte = ENTES.map((ente) => {
    const v = valor.find((d) => d.ente_tipo === ente)!;
    const c = contemplados.find((d) => d.ente_tipo === ente)!;
    return { ente, valor: v.valor, contemplados: c.contemplados };
  });

  const registro = <T,>(f: (d: (typeof porEnte)[number]) => T) =>
    Object.fromEntries(porEnte.map((d) => [d.ente, f(d)]));

  const categorias = [
    { key: 'Estado', label: 'Estados' },
    { key: 'Município', label: 'Municípios' },
  ];

  const barras: [BarraFluxo, BarraFluxo] = [
    {
      label: 'Contemplados',
      cor: corContemplados,
      valores: registro((d) => d.contemplados),
      detalhes: registro((d) => num(d.contemplados)),
    },
    {
      label: 'Recursos',
      cor: corRecursos,
      valores: registro((d) => d.valor),
      detalhes: registro((d) => brlCurto(d.valor)),
    },
  ];

  const notas = registro((d) => `${brlCurto(d.valor / d.contemplados)} por contemplado, em média`);
</script>

<FluxoComposicaoChart
  {categorias}
  {barras}
  {notas}
  title="Contemplados e recursos por tipo de ente"
  subtitle="Participação de estados e municípios no total de contemplados e no total de recursos (%)"
  formatValue={pct}
  source={FONTE}
  {background}
  bind:svgEl
/>
