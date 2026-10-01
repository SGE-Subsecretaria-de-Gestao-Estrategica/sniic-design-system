<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhasComparadasChart from '$lib/components/eixo6/LinhasComparadasChart.svelte';
  import { LINHAS_COMPARADAS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, seriesPorAno } from './_exemplos';

  /**
   * Poucas séries pares, cada uma com a cor própria da paleta do pilar e o
   * nome na ponta. É o `LinhasComparadasChart` com `colorBy="series"`.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Linhas por série' });

  const pct = (v: number) => `${Math.round(v)}%`;
  const etapas = LINHAS_COMPARADAS_STEPS;
  const series = [...new Set(seriesPorAno.map((d) => d.group))];
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasComparadasChart
        data={seriesPorAno}
        colorBy="series"
        formatValue={pct}
        valueLabels="all"
        title="Três séries em três medições"
        subtitle="Valor de cada série (%)"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={series} bind:highlight />
      <LinhasComparadasChart
        data={seriesPorAno}
        colorBy="series"
        formatValue={pct}
        {step}
        {highlight}
        title="Três séries em três medições"
      />
    </div>
  {/snippet}
</Story>
