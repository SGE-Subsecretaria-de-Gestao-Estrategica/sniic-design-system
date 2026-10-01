<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PontosPaineisChart from '$lib/components/eixo6/PontosPaineisChart.svelte';
  import { PONTOS_PAINEIS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { FONTE, pontosPaineis } from './_exemplos';

  /**
   * Um ponto por unidade, a mesma grade em cada painel, repartida de um jeito
   * diferente em cada um: a área de cada bloco é a própria contagem.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Matriz de pontos' });

  const etapas = PONTOS_PAINEIS_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <PontosPaineisChart
        panels={pontosPaineis}
        title="O mesmo conjunto, repartido de quatro maneiras"
        subtitle="Um ponto por unidade · 600 unidades"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <PontosPaineisChart panels={pontosPaineis} title="Matriz de pontos" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={pontosPaineis.map((p) => p.title)} bind:highlight />
      <PontosPaineisChart
        panels={pontosPaineis}
        {step}
        {highlight}
        title="O mesmo conjunto, repartido de quatro maneiras"
      />
    </div>
  {/snippet}
</Story>
