<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import ClassificacaoTerritorialChart from '$lib/components/lpg/ClassificacaoTerritorialChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';

  const { Story } = defineMeta({
    title: 'LPG/1.2.2 Capital, RM e interior/Classificação territorial',
    component: ClassificacaoTerritorialChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: { background: '#ffffff' },
  });

  type StoryArgs = ComponentProps<typeof ClassificacaoTerritorialChart>;
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    <ClassificacaoTerritorialChart {...args} />
  </StoryFrame>
{/snippet}

<!-- `template as never`: ver a nota em src/stories/eixo1/CaboGuerraMunicipalChart.stories.svelte. -->

<Story name="Recursos" args={{ metrica: 'valor' }} template={template as never} />

<Story name="Contemplados" args={{ metrica: 'contemplados' }} template={template as never} />

<!-- Sem o cartão: o gráfico sobre o fundo da própria página. -->
<Story name="Sem fundo" args={{ metrica: 'valor', background: null }} template={template as never} />
