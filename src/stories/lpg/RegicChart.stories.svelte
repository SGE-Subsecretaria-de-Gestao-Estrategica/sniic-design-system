<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import RegicChart from '$lib/components/lpg/RegicChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';

  const { Story } = defineMeta({
    title: 'LPG/1.2.3 REGIC/Hierarquia urbana',
    component: RegicChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: { background: '#ffffff' },
  });

  type StoryArgs = ComponentProps<typeof RegicChart>;
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    <RegicChart {...args} />
  </StoryFrame>
{/snippet}

<!-- `template as never`: ver a nota em src/stories/eixo1/CaboGuerraMunicipalChart.stories.svelte. -->

<Story name="Contemplados" args={{ metrica: 'contemplados' }} template={template as never} />

<Story name="Valor executado" args={{ metrica: 'valor' }} template={template as never} />

<!-- Sem o cartão: o gráfico sobre o fundo da própria página. -->
<Story name="Sem fundo" args={{ metrica: 'contemplados', background: null }} template={template as never} />
