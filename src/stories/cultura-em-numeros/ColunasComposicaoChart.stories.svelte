<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ColunasEmpilhadasChart from '$lib/components/eixo6/ColunasEmpilhadasChart.svelte';
  import { COLUNAS_EMPILHADAS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, composicaoPorAno } from './_exemplos';

  /**
   * Colunas que fecham em 100%: a composição de cada ano, não o volume.
   * É o `ColunasEmpilhadasChart` com `normalize`.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Composição' });

  const keys = ['a', 'b', 'c'];
  const labels = { a: 'Categoria A', b: 'Categoria B', c: 'Categoria C' };
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
        data={composicaoPorAno}
        {keys}
        {labels}
        normalize
        title="A participação de cada categoria, onda a onda"
        subtitle="Participação no total de cada ano (%)"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<!-- Um trecho sem série marcado com colchete: zero que significa "não foi medido". -->
<Story name="Com trecho sem medição">
  {#snippet template()}
    <div style="max-width: 680px;">
      <ColunasEmpilhadasChart
        data={composicaoPorAno}
        {keys}
        {labels}
        normalize
        spans={[{ from: '2009', to: '2012', text: 'sem medição neste período' }]}
        title="A participação de cada categoria, onda a onda"
      />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={Object.values(labels)} bind:highlight />
      <ColunasEmpilhadasChart
        data={composicaoPorAno}
        {keys}
        {labels}
        normalize
        {step}
        {highlight}
        title="A participação de cada categoria, onda a onda"
      />
    </div>
  {/snippet}
</Story>
