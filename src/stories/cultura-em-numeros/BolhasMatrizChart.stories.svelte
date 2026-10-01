<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BolhasMatrizChart from '$lib/components/eixo6/BolhasMatrizChart.svelte';
  import { BOLHAS_MATRIZ_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, matrizColunas, matrizLinhas } from './_exemplos';

  /**
   * Linhas por colunas, uma bolha por cruzamento: a área é o valor, e a cor
   * acompanha o mesmo valor na rampa do pilar.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Matriz de bolhas' });

  const pct = (v: number) => `${v.toFixed(1).replace('.', ',')}%`;
  const etapas = BOLHAS_MATRIZ_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <BolhasMatrizChart
        columns={matrizColunas}
        rows={matrizLinhas}
        formatValue={pct}
        rowLabel="Grupo"
        title="Como cada grupo se distribui pelas classes"
        subtitle="Participação de cada classe no grupo (%)"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <BolhasMatrizChart columns={matrizColunas} rows={matrizLinhas} formatValue={pct} title="Matriz de bolhas" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={matrizLinhas.map((r) => r.label)} bind:highlight />
      <BolhasMatrizChart
        columns={matrizColunas}
        rows={matrizLinhas}
        formatValue={pct}
        {step}
        {highlight}
        title="Como cada grupo se distribui pelas classes"
      />
    </div>
  {/snippet}
</Story>
