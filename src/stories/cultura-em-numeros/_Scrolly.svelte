<script lang="ts">
  /**
   * O padrão de consumo de um gráfico com `step`: o gráfico preso no topo, uma
   * seção por etapa, e o driver de scroll decidindo a etapa ativa. É tudo o que
   * um projeto host precisa montar — o resto é do gráfico.
   */
  import type { Snippet } from 'svelte';
  import type { ChartStep } from '$lib/components/eixo6/types';
  import { ScrollySteps, scrollStep } from '$lib/core/interaction/scrolly.svelte';
  import { DefaultTheme } from '$lib/core/theme';

  let { etapas, grafico }: { etapas: ChartStep[]; grafico: Snippet<[number]> } = $props();

  const scrolly = new ScrollySteps();

  /** Cores do tema padrão, passadas ao CSS como variáveis. */
  const { palette } = DefaultTheme;
</script>

<div
  class="scrolly"
  style:--linha={palette.base[300]}
  style:--suave={palette.neutral[100]}
  style:--texto={palette.neutral[300]}
  style:--ativa={palette.secondary}
>
  <div class="graphic">
    {@render grafico(scrolly.step)}
  </div>

  <div class="steps">
    {#each etapas as etapa, i (etapa.id)}
      <section use:scrollStep={{ scrolly, index: i }} class:active={scrolly.step === i}>
        <p>{etapa.label}</p>
      </section>
    {/each}
  </div>
</div>

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
    border-left: 3px solid var(--linha);
    font: 500 0.9375rem/1.5 system-ui, sans-serif;
    color: var(--suave);
    transition:
      color 250ms ease-out,
      border-color 250ms ease-out;
  }

  section.active p {
    border-left-color: var(--ativa);
    color: var(--texto);
  }
</style>
