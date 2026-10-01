<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LinhasPaineisChart from '$lib/components/eixo6/LinhasPaineisChart.svelte';
  import { LINHAS_PAINEIS_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import Scrolly from './_Scrolly.svelte';
  import { FONTE, paineis, paineisAnos, paineisReferencia } from './_exemplos';

  /**
   * Um painel por grupo, no mesmo eixo de anos e na mesma escala, com a
   * referência ao fundo de cada um. Um `null` é um ano sem medição: a linha
   * se interrompe ali.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Linhas em painéis' });

  const pct = (v: number) => `${Math.round(v)}%`;
  const etapas = LINHAS_PAINEIS_STEPS;
  const grupos = paineis.map((p) => p.label);
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <LinhasPaineisChart
        years={paineisAnos}
        panels={paineis}
        reference={paineisReferencia}
        referenceLabel="Referência"
        formatValue={pct}
        title="Cada grupo diante da referência"
        subtitle="Valor de cada grupo ao longo das medições (%)"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <LinhasPaineisChart years={paineisAnos} panels={paineis} reference={paineisReferencia} formatValue={pct} title="Linhas em painéis" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={grupos} bind:highlight />
      <LinhasPaineisChart
        years={paineisAnos}
        panels={paineis}
        reference={paineisReferencia}
        formatValue={pct}
        {step}
        {highlight}
        title="Cada grupo diante da referência"
      />
    </div>
  {/snippet}
</Story>

<Story name="Scrollytelling">
  {#snippet template()}
    <Scrolly {etapas}>
      {#snippet grafico(etapa: number)}
        <LinhasPaineisChart
          years={paineisAnos}
          panels={paineis}
          reference={paineisReferencia}
          formatValue={pct}
          step={etapa}
          title="Cada grupo diante da referência"
        />
      {/snippet}
    </Scrolly>
  {/snippet}
</Story>
