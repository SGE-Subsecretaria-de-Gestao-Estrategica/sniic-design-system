<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { onMount } from "svelte";
  import InformalidadeChart from "$lib/components/eixo6/InformalidadeChart.svelte";
  import { INFORMALIDADE_STEPS } from "$lib/components/eixo6/steps";
  import {
    loadInformalidade,
    type InformalidadeDatum,
  } from "$lib/components/eixo6/data";

  const { Story } = defineMeta({ title: "Dist/Eixo 6" });
</script>

<script lang="ts">
  let data = $state<InformalidadeDatum[]>([]);
  let step = $state(INFORMALIDADE_STEPS.length - 1);

  onMount(async () => {
    data = await loadInformalidade();
  });
</script>

<Story name="Informalidade EC e BR por ano">
  {#snippet template()}
    {#if data.length}
      <div style="max-width: 680px;">
        <InformalidadeChart
          {data}
          title="Informalidade na Economia Criativa e no Brasil"
          subtitle="Taxa de informalidade e a distância entre as duas, em pontos percentuais"
          source="Fonte: PNAD Contínua/IBGE."
        />
      </div>
    {/if}
  {/snippet}
</Story>

<Story name="Informalidade — etapas do scrollytelling">
  {#snippet template()}
    {#if data.length}
      <div style="max-width: 680px; display: grid; gap: 1rem;">
        <label style="font: 500 13px/1.4 system-ui; display: grid; gap: 0.35rem;">
          Etapa {step + 1} de {INFORMALIDADE_STEPS.length} —
          {INFORMALIDADE_STEPS[step]?.label}
          <input
            type="range"
            min="0"
            max={INFORMALIDADE_STEPS.length - 1}
            bind:value={step}
          />
        </label>

        <InformalidadeChart
          {data}
          {step}
          title="Informalidade na Economia Criativa e no Brasil"
        />
      </div>
    {/if}
  {/snippet}
</Story>
