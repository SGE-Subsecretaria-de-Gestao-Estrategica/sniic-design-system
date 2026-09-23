<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { onMount } from "svelte";
  import SetoresComparadosChart from "$lib/components/eixo6/SetoresComparadosChart.svelte";
  import { SETORES_STEPS } from "$lib/components/eixo6/steps";
  import { loadSetores, type SetorAnoDatum } from "$lib/components/eixo6/data";
  import { ScrollySteps, scrollStep } from "$lib/core/interaction/scrolly.svelte";

  const { Story } = defineMeta({ title: "Dist/Eixo 6" });
</script>

<script lang="ts">
  let data = $state<SetorAnoDatum[]>([]);
  let step = $state(SETORES_STEPS.length - 1);
  let highlight = $state<string | null>(null);

  let setores = $derived([...new Set(data.map((d) => d.group))].sort());

  // Exactly the wiring a host project needs: a sticky graphic, one section per
  // step, and the scroll driver setting `step`. Nothing else is required to
  // consume these charts from another Svelte app.
  const scrolly = new ScrollySteps();

  onMount(async () => {
    data = await loadSetores();
  });
</script>

<Story name="Trabalhadores da cultura e outros setores por ano">
  {#snippet template()}
    {#if data.length}
      <div style="max-width: 680px;">
        <SetoresComparadosChart
          {data}
          title="A Economia Criativa comparada a outros setores"
          subtitle="Postos de trabalho por setor, 2016–2025"
          source="Fonte: RAIS/MTE. A série tem quebra metodológica em 2022."
        />
      </div>
    {/if}
  {/snippet}
</Story>

<Story name="Setores — etapas e destaque">
  {#snippet template()}
    {#if data.length}
      <div style="max-width: 680px; display: grid; gap: 1rem;">
        <label style="font: 500 13px/1.4 system-ui; display: grid; gap: 0.35rem;">
          Etapa {step + 1} de {SETORES_STEPS.length} — {SETORES_STEPS[step]?.label}
          <input type="range" min="0" max={SETORES_STEPS.length - 1} bind:value={step} />
        </label>

        <label style="font: 500 13px/1.4 system-ui; display: grid; gap: 0.35rem;">
          Destacar setor
          <select bind:value={highlight}>
            <option value={null}>Nenhum</option>
            {#each setores as setor (setor)}
              <option value={setor}>{setor}</option>
            {/each}
          </select>
        </label>

        <SetoresComparadosChart
          {data}
          {step}
          {highlight}
          title="A Economia Criativa comparada a outros setores"
        />
      </div>
    {/if}
  {/snippet}
</Story>

<Story name="Setores — scrollytelling — padrão de consumo">
  {#snippet template()}
    {#if data.length}
      <div class="scrolly">
        <div class="graphic">
          <SetoresComparadosChart
            {data}
            step={scrolly.step}
            title="A Economia Criativa comparada a outros setores"
            subtitle="Postos de trabalho por setor, 2016–2025"
          />
        </div>

        <div class="steps">
          {#each SETORES_STEPS as etapa, i (etapa.id)}
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

