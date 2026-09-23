<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { onMount } from "svelte";
  import RacaCorChart from "$lib/components/eixo6/RacaCorChart.svelte";
  import { RACA_COR_STEPS } from "$lib/components/eixo6/steps";
  import { loadRacaCor, type RacaCorDatum } from "$lib/components/eixo6/data";
  import { ScrollySteps, scrollStep } from "$lib/core/interaction/scrolly.svelte";

  const { Story } = defineMeta({ title: "Dist/Eixo 6" });
</script>

<script lang="ts">
  let data = $state<RacaCorDatum[]>([]);
  let step = $state(RACA_COR_STEPS.length - 1);
  let highlight = $state<string | null>(null);

  let categorias = $derived([
    ...new Set(data.filter((d) => d.scope === "EC").map((d) => d.category)),
  ]);

  // Exactly the wiring a host project needs: a sticky graphic, one section per
  // step, and the scroll driver setting `step`. Nothing else is required to
  // consume these charts from another Svelte app.
  const scrolly = new ScrollySteps();

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

<Story name="Cor ou raça — scrollytelling — padrão de consumo">
  {#snippet template()}
    {#if data.length}
      <div class="scrolly">
        <div class="graphic">
          <RacaCorChart
            {data}
            step={scrolly.step}
            title="Trabalhadores por cor ou raça"
            subtitle="Participação na Economia Criativa e no conjunto do país"
          />
        </div>

        <div class="steps">
          {#each RACA_COR_STEPS as etapa, i (etapa.id)}
            <section use:scrollStep={{ scrolly, index: i }} class:active={scrolly.step === i}>
              <p>{etapa.label}</p>
            </section>
          {/each}
        </div>
      </div>
    {/if}
  {/snippet}
</Story>

<style>
  .scrolly {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 20rem;
    gap: 2rem;
    align-items: start;
    max-width: 62rem;
  }

  .graphic {
    position: sticky;
    top: 20vh;
  }

  .steps {
    display: grid;
  }

  section {
    min-height: 70vh;
    display: flex;
    align-items: center;
  }

  section p {
    margin: 0;
    padding: 1rem 1.25rem;
    border-left: 3px solid #eceeed;
    font: 500 0.9375rem/1.5 system-ui, sans-serif;
    color: #808679;
    transition:
      color 250ms ease-out,
      border-color 250ms ease-out;
  }

  section.active p {
    border-left-color: #265c4f;
    color: #2d2e2b;
  }
</style>

