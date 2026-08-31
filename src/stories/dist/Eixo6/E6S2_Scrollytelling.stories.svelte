<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { onMount } from "svelte";
  import InformalidadeChart from "$lib/components/eixo6/InformalidadeChart.svelte";
  import { INFORMALIDADE_STEPS } from "$lib/components/eixo6/steps";
  import {
    loadInformalidade,
    type InformalidadeDatum,
  } from "$lib/components/eixo6/data";
  import { ScrollySteps, scrollStep } from "$lib/core/interaction/scrolly.svelte";

  const { Story } = defineMeta({ title: "Dist/Eixo 6" });
</script>

<script lang="ts">
  // Exactly the wiring a host project needs: a sticky graphic, one section per
  // step, and the scroll driver setting `step`. Nothing else is required to
  // consume these charts from another Svelte app.
  const scrolly = new ScrollySteps();

  let data = $state<InformalidadeDatum[]>([]);

  onMount(async () => {
    data = await loadInformalidade();
  });
</script>

<Story name="Scrollytelling — padrão de consumo">
  {#snippet template()}
    {#if data.length}
      <div class="scrolly">
        <div class="graphic">
          <InformalidadeChart
            {data}
            step={scrolly.step}
            title="Informalidade na Economia Criativa e no Brasil"
          />
        </div>

        <div class="steps">
          {#each INFORMALIDADE_STEPS as etapa, i (etapa.id)}
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
