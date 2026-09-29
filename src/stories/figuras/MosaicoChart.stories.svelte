<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import MosaicoChart from '$lib/components/figuras/MosaicoChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';
  import { colorScales } from '$lib/tokens';

  /** Treemap: a área é o valor; o rótulo pode dizer outra medida. */
  const DEFAULT = {
    pecas: [
      { key: 'ne', label: 'Nordeste', valor: 93434, cor: colorScales.yellow[1], detalhe: 'média R$ 13,7 mil' },
      { key: 'se', label: 'Sudeste', valor: 56426, cor: colorScales.orange[2], detalhe: 'média R$ 27,5 mil' },
      { key: 'su', label: 'Sul', valor: 21915, cor: colorScales.blue[2], detalhe: 'média R$ 25,4 mil' },
      { key: 'no', label: 'Norte', valor: 16734, cor: colorScales.lime[2], detalhe: 'média R$ 28,8 mil' },
      { key: 'co', label: 'Centro-Oeste', valor: 10941, cor: colorScales.red[2], detalhe: 'média R$ 28,6 mil' },
    ],
    title: 'Contemplados e valor médio por região',
    subtitle: 'Área proporcional ao número de contemplados',
    formatValue: (v: number) => v.toLocaleString('pt-BR'),
    source: 'Fonte: dados ilustrativos.',
    background: '#ffffff',
  };

  const { Story } = defineMeta({
    title: 'Charts/Figuras/Mosaico',
    component: MosaicoChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: DEFAULT,
  });

  type StoryArgs = ComponentProps<typeof MosaicoChart>;
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    <MosaicoChart {...args} />
  </StoryFrame>
{/snippet}

<!-- `template as never`: ver a nota em src/stories/eixo1/CaboGuerraMunicipalChart.stories.svelte. -->

<Story name="Padrão" args={{}} template={template as never} />

<Story name="Sem legenda" args={{ legenda: false }} template={template as never} />
