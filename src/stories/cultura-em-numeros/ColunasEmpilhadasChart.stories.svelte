<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ColunasEmpilhadasChart from '$lib/components/eixo6/ColunasEmpilhadasChart.svelte';
  import { COLUNAS_EMPILHADAS_STEPS } from '$lib/components/eixo6/steps';
  import { formatLocale } from '$lib/core/format';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, colunasCategoria } from './_exemplos';

  /**
   * Uma coluna por categoria, as séries empilhadas em valor absoluto. Cada
   * coluna é uma `CapsuleStack` — a cápsula da família dividida em faixas.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Colunas empilhadas' });

  const keys = ['a', 'b', 'c'];
  const labels = { a: 'Série A', b: 'Série B', c: 'Série C' };
  const bi = (v: number) => formatLocale.format(',.1f')(v);
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
        data={colunasCategoria}
        {keys}
        {labels}
        formatValue={bi}
        title="O total de cada categoria, por série"
        subtitle="R$ bilhões"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <ColunasEmpilhadasChart data={colunasCategoria} {keys} {labels} formatValue={bi} title="Colunas empilhadas" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={Object.values(labels)} bind:highlight />
      <ColunasEmpilhadasChart
        data={colunasCategoria}
        {keys}
        {labels}
        formatValue={bi}
        {step}
        {highlight}
        title="O total de cada categoria, por série"
      />
    </div>
  {/snippet}
</Story>

<Story name="Scrollytelling">
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <ColunasEmpilhadasChart
          data={colunasCategoria}
          {keys}
          {labels}
          formatValue={bi}
          step={etapa}
          title="O total de cada categoria, por série"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
