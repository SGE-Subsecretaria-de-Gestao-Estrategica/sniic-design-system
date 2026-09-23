<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { onMount } from 'svelte';
  import AgentesPorMunicipioChart from '$lib/components/eixo1/AgentesPorMunicipioChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';
  import {
    loadMalhaMunicipiosProjetada,
    type MalhaMunicipiosProjetada,
  } from '$lib/components/eixo1/malhaMunicipal';

  const { Story } = defineMeta({
    title: 'Cultura em Números/Eixo 1/Gestão e Participação/Participação social/Agentes por município',
    component: AgentesPorMunicipioChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: { background: null },
  });

  type StoryArgs = ComponentProps<typeof AgentesPorMunicipioChart>;
</script>

<script lang="ts">
  /**
   * A malha municipal (1,1MB) não é importada estaticamente — ver
   * `malhaMunicipal.ts`. A story busca em runtime, como um host real faria.
   */
  let malha = $state<MalhaMunicipiosProjetada | null>(null);

  onMount(async () => {
    malha = await loadMalhaMunicipiosProjetada();
  });
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    {#if malha}
      <AgentesPorMunicipioChart {...args} {malha} />
    {/if}
  </StoryFrame>
{/snippet}

<!--
  O denominador da contagem por UF, desenhado: quantos municípios cabem a
  cada agente territorial, malha municipal inteira, cor constante dentro do
  estado porque o registro é por UF.

  `template={template as never}`: the addon's `Snippet` brand and Svelte's own
  do not unify under svelte-check, so a correctly typed snippet is still
  rejected. The cast is on the hand-off only — the snippet itself stays typed.
-->

<Story name="Padrão" args={{}} template={template as never} />

<!-- O cartão com o próprio fundo, para páginas não brancas. -->
<Story name="Com cartão" args={{ background: '#ffffff' }} template={template as never} />
