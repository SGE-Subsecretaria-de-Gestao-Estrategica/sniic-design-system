<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ColunasEmpilhadasChart from '$lib/components/eixo6/ColunasEmpilhadasChart.svelte';
  import { COLUNAS_EMPILHADAS_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import Etapas from './_Etapas.svelte';
  import { FONTE, fontesPorAno } from './_exemplos';

  /**
   * Colunas por ano com as fontes reordenadas pelo valor — a maior no topo —
   * e fitas ligando a mesma fonte de um ano ao outro: quando a ordem muda, as
   * fitas se cruzam. É o `ColunasEmpilhadasChart` com `rank` e `ribbons`.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Colunas com fitas' });

  const keys = ['a', 'b', 'c', 'd'];
  const labels = { a: 'Fonte A', b: 'Fonte B', c: 'Fonte C', d: 'Fonte D' };
  const bi = (v: number) => `${formatLocale.format(',.1f')(v)} bi`;
  const etapas = COLUNAS_EMPILHADAS_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <ColunasEmpilhadasChart
        data={fontesPorAno}
        {keys}
        {labels}
        rank
        ribbons
        formatValue={bi}
        title="Fontes que se revezam, ano a ano"
        subtitle="Valor por fonte, R$ · 2019–2024"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={Object.values(labels)} bind:highlight />
      <ColunasEmpilhadasChart
        data={fontesPorAno}
        {keys}
        {labels}
        rank
        ribbons
        formatValue={bi}
        {step}
        {highlight}
        title="Fontes que se revezam, ano a ano"
      />
    </div>
  {/snippet}
</Story>
