<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import FaixaValorNacionalChart from '$lib/components/lpg/FaixaValorNacionalChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';

  const { Story } = defineMeta({
    title: 'LPG/1.1.1 Dados gerais/Contemplados e recursos por faixa de valor',
    component: FaixaValorNacionalChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: { background: '#ffffff' },
  });

  type StoryArgs = ComponentProps<typeof FaixaValorNacionalChart>;
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    <FaixaValorNacionalChart {...args} />
  </StoryFrame>
{/snippet}

<!-- `template as never`: ver a nota em src/stories/eixo1/CaboGuerraMunicipalChart.stories.svelte. -->

<Story name="Padrão" args={{}} template={template as never} />

<!-- Sem o cartão: o gráfico sobre o fundo da própria página. -->
<Story name="Sem fundo" args={{ background: null }} template={template as never} />
