<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CristasDensidadeChart from '$lib/components/eixo6/CristasDensidadeChart.svelte';
  import { CRISTAS_DENSIDADE_STEPS } from '$lib/components/eixo6/steps';
  import Etapas from './_Etapas.svelte';
  import { CRISTAS_REFERENCIA, CRISTAS_XMAX, FONTE, cristas } from './_exemplos';

  /**
   * A forma da distribuição de cada grupo, uma sob a outra. Além da
   * referência, a cor se aprofunda: a parte do grupo que a ultrapassa é uma
   * área antes de ser um número.
   */
  const { Story } = defineMeta({ title: 'Cultura em Números/Cristas' });

  const etapas = CRISTAS_DENSIDADE_STEPS;
</script>

<script lang="ts">
  let step = $state(etapas.length - 1);
  let highlight = $state<string | null>(null);
</script>

<Story name="Padrão">
  {#snippet template()}
    <div style="max-width: 680px;">
      <CristasDensidadeChart
        ridges={cristas}
        xMax={CRISTAS_XMAX}
        reference={CRISTAS_REFERENCIA}
        referenceLabel="Meta"
        formatX={(v) => `${v}%`}
        title="A forma da distribuição de cada grupo"
        subtitle="Densidade das unidades ao longo do valor (%)"
        source={FONTE}
      />
    </div>
  {/snippet}
</Story>

<Story name="Coluna estreita">
  {#snippet template()}
    <div style="max-width: 360px;">
      <CristasDensidadeChart ridges={cristas} xMax={CRISTAS_XMAX} reference={CRISTAS_REFERENCIA} formatX={(v) => `${v}%`} title="Cristas" />
    </div>
  {/snippet}
</Story>

<Story name="Etapas e destaque">
  {#snippet template()}
    <div style="max-width: 680px; display: grid; gap: 1rem;">
      <Etapas {etapas} bind:step opcoes={cristas.map((c) => c.label)} bind:highlight />
      <CristasDensidadeChart
        ridges={cristas}
        xMax={CRISTAS_XMAX}
        reference={CRISTAS_REFERENCIA}
        referenceLabel="Meta"
        formatX={(v) => `${v}%`}
        {step}
        {highlight}
        title="A forma da distribuição de cada grupo"
      />
    </div>
  {/snippet}
</Story>
