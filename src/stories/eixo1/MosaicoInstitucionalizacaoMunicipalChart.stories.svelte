<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import { onMount } from 'svelte';
  import MosaicoInstitucionalizacaoMunicipalChart from '$lib/components/eixo1/MosaicoInstitucionalizacaoMunicipalChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';
  import {
    loadGestaoMunicipios2021,
    loadMalhaMunicipiosProjetada,
    type GestaoMunicipios2021,
    type MalhaMunicipiosProjetada,
  } from '$lib/components/eixo1/malhaMunicipal';

  const { Story } = defineMeta({
    title: 'Cultura em Números/Eixo 1/Gestão e Participação/Gestão municipal/Institucionalização (mosaico)',
    component: MosaicoInstitucionalizacaoMunicipalChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: { background: null },
  });

  type StoryArgs = ComponentProps<typeof MosaicoInstitucionalizacaoMunicipalChart>;
</script>

<script lang="ts">
  /**
   * A malha municipal (1,1MB) e o gabarito de institucionalização (160KB) não
   * são importados estaticamente — ver `malhaMunicipal.ts`. A story busca em
   * runtime, como um host real faria.
   */
  let malhaMunicipios = $state<MalhaMunicipiosProjetada | null>(null);
  let dados = $state<GestaoMunicipios2021 | null>(null);

  onMount(async () => {
    [malhaMunicipios, dados] = await Promise.all([
      loadMalhaMunicipiosProjetada(),
      loadGestaoMunicipios2021(),
    ]);
  });
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    {#if malhaMunicipios && dados}
      <MosaicoInstitucionalizacaoMunicipalChart {...args} {malhaMunicipios} {dados} />
    {/if}
  </StoryFrame>
{/snippet}

<!--
  A granularidade mais fina da coleção: os 5.570 municípios, cada um na cor
  do próprio grau de institucionalização do tripé do SNC, não da média do
  seu estado.

  `template={template as never}`: the addon's `Snippet` brand and Svelte's own
  do not unify under svelte-check, so a correctly typed snippet is still
  rejected. The cast is on the hand-off only — the snippet itself stays typed.
-->

<Story name="Padrão" args={{}} template={template as never} />

<!-- O cartão com o próprio fundo, para páginas não brancas. -->
<Story name="Com cartão" args={{ background: '#ffffff' }} template={template as never} />
