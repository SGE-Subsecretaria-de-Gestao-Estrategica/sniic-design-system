<script lang="ts" module>
  /** Uma seção do texto: o que se lê de um lado enquanto o gráfico muda do outro. */
  export type Passagem = { id: string; titulo?: string; texto: string };
</script>

<script lang="ts">
  /**
   * Storytelling lado a lado: o texto corre numa coluna e o gráfico fica preso
   * na outra, recebendo o índice da passagem ativa. Em telas estreitas o
   * gráfico vai para o topo e o texto passa por cima dele, em cartões.
   */
  import type { Snippet } from 'svelte';
  import { ScrollySteps, scrollStep } from '$lib/core/interaction/scrolly.svelte';
  import { DefaultTheme } from '$lib/core/theme';

  let { passagens, grafico }: { passagens: Passagem[]; grafico: Snippet<[number]> } = $props();

  const scrolly = new ScrollySteps({ offset: 0.6 });

  /** Cores do tema padrão, passadas ao CSS como variáveis. */
  const { palette } = DefaultTheme;
</script>

<div
  class="lado"
  style:--linha={palette.base[300]}
  style:--suave={palette.neutral[100]}
  style:--texto={palette.neutral[300]}
  style:--ativa={palette.secondary}
>
  <div class="texto">
    {#each passagens as p, i (p.id)}
      <section use:scrollStep={{ scrolly, index: i }} class:active={scrolly.step === i}>
        <div class="cartao">
          {#if p.titulo}<h4>{p.titulo}</h4>{/if}
          <p>{p.texto}</p>
        </div>
      </section>
    {/each}
  </div>

  <div class="grafico">
    {@render grafico(scrolly.step)}
  </div>
</div>

<style>
  .lado {
    display: grid;
    grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr);
    gap: 3rem;
    align-items: start;
    max-width: 68rem;
  }

  .grafico {
    position: sticky;
    top: 8vh;
    /* O mapa tem a proporção do Brasil: limitar a largura limita a altura. */
    width: min(100%, 82vh);
    justify-self: center;
  }

  .texto {
    padding: 30vh 0 50vh;
  }

  section {
    min-height: 75vh;
    display: flex;
    align-items: center;
  }

  .cartao {
    padding: 1rem 1.25rem;
    border-left: 3px solid var(--linha);
    transition: border-color 250ms ease-out;
  }

  h4 {
    margin: 0 0 0.375rem;
    font: 600 1rem/1.3 'General Sans Variable', system-ui, sans-serif;
    color: var(--suave);
    transition: color 250ms ease-out;
  }

  p {
    margin: 0;
    font: 400 0.9375rem/1.55 'General Sans Variable', system-ui, sans-serif;
    color: var(--suave);
    transition: color 250ms ease-out;
  }

  section.active .cartao {
    border-left-color: var(--ativa);
  }

  section.active h4,
  section.active p {
    color: var(--texto);
  }

  @media (max-width: 720px) {
    .lado {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }

    /* Os dois na mesma célula: o gráfico fica preso enquanto o texto inteiro passa. */
    .grafico,
    .texto {
      grid-area: 1 / 1;
    }

    .grafico {
      top: 0;
      width: 100%;
    }

    .texto {
      position: relative;
      z-index: 1;
      padding: 60vh 0 40vh;
    }

    .cartao {
      border-left: 0;
      border-radius: 6px;
      background: rgb(254 255 252 / 0.94);
      box-shadow: 0 1px 4px rgb(45 46 43 / 0.15);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cartao,
    h4,
    p {
      transition: none;
    }
  }
</style>
