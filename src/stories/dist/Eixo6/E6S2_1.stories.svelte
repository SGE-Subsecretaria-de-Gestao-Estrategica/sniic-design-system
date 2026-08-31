<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { onMount } from "svelte";
  import TrabalhadoresCulturaChart from "$lib/components/eixo6/TrabalhadoresCulturaChart.svelte";
  import { TRABALHADORES_CULTURA_STEPS } from "$lib/components/eixo6/steps";
  import {
    loadTrabalhadoresCultura,
    type TrabalhadoresCulturaDatum,
  } from "$lib/components/eixo6/data";

  const { Story } = defineMeta({ title: "Dist/Eixo 6" });
</script>

<script lang="ts">
  let data = $state<TrabalhadoresCulturaDatum[]>([]);
  let step = $state(TRABALHADORES_CULTURA_STEPS.length - 1);

  onMount(async () => {
    data = await loadTrabalhadoresCultura();
  });
</script>

<Story name="Trabalhadores da cultura por ano">
  {#snippet template()}
    {#if data.length}
      <div style="max-width: 680px;">
        <TrabalhadoresCulturaChart
          {data}
          title="Postos de trabalho na Economia Criativa"
          subtitle="E sua participação no total de vínculos de trabalho do país, 2015–2024"
          source="Fonte: RAIS/MTE e PNAD Contínua/IBGE. A série tem quebra metodológica em 2022."
        />
      </div>
    {/if}
  {/snippet}
</Story>

<Story name="Trabalhadores da cultura — etapas do scrollytelling">
  {#snippet template()}
    {#if data.length}
      <div style="max-width: 680px; display: grid; gap: 1rem;">
        <label style="font: 500 13px/1.4 system-ui; display: grid; gap: 0.35rem;">
          Etapa {step + 1} de {TRABALHADORES_CULTURA_STEPS.length} —
          {TRABALHADORES_CULTURA_STEPS[step]?.label}
          <input
            type="range"
            min="0"
            max={TRABALHADORES_CULTURA_STEPS.length - 1}
            bind:value={step}
          />
        </label>

        <TrabalhadoresCulturaChart
          {data}
          {step}
          title="Postos de trabalho na Economia Criativa"
          subtitle="Cada etapa corresponde a uma seção do scrollytelling no projeto que consome o pacote"
        />
      </div>
    {/if}
  {/snippet}
</Story>
