<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { onMount } from "svelte";
  import RacaCorChart from "$lib/components/eixo6/RacaCorChart.svelte";
  import { RACA_COR_STEPS } from "$lib/components/eixo6/steps";
  import { loadRacaCor, type RacaCorDatum } from "$lib/components/eixo6/data";

  const { Story } = defineMeta({ title: "Dist/Eixo 6" });
</script>

<script lang="ts">
  let data = $state<RacaCorDatum[]>([]);
  let step = $state(RACA_COR_STEPS.length - 1);
  let highlight = $state<string | null>(null);

  let categorias = $derived([
    ...new Set(data.filter((d) => d.scope === "EC").map((d) => d.category)),
  ]);

  onMount(async () => {
    data = await loadRacaCor();
  });
</script>

<Story name="Percentual de trabalhadores por cor ou raça">
  {#snippet template()}
    {#if data.length}
      <div style="max-width: 680px;">
        <RacaCorChart
          {data}
          title="Trabalhadores por cor ou raça"
          subtitle="Participação na Economia Criativa e no conjunto do país"
          source="Fonte: RAIS/MTE."
        />
      </div>
    {/if}
  {/snippet}
</Story>

<Story name="Cor ou raça — etapas e destaque">
  {#snippet template()}
    {#if data.length}
      <div style="max-width: 680px; display: grid; gap: 1rem;">
        <label style="font: 500 13px/1.4 system-ui; display: grid; gap: 0.35rem;">
          Etapa {step + 1} de {RACA_COR_STEPS.length} — {RACA_COR_STEPS[step]?.label}
          <input type="range" min="0" max={RACA_COR_STEPS.length - 1} bind:value={step} />
        </label>

        <label style="font: 500 13px/1.4 system-ui; display: grid; gap: 0.35rem;">
          Destacar categoria
          <select bind:value={highlight}>
            <option value={null}>Nenhuma</option>
            {#each categorias as categoria (categoria)}
              <option value={categoria}>{categoria}</option>
            {/each}
          </select>
        </label>

        <RacaCorChart {data} {step} {highlight} title="Trabalhadores por cor ou raça" />
      </div>
    {/if}
  {/snippet}
</Story>
