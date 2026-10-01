<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import HalteresChart from '$lib/components/figuras/HalteresChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';
  import { colorScales } from '$lib/tokens';

  /** Participação de cada grupo em duas medidas — contemplados (a) e recursos (b). */
  const DEFAULT = {
    linhas: [
      { key: 'g1', label: 'Grupo A', a: 11.1, b: 30.4, extra: 'R$ 30,9 mil' },
      { key: 'g2', label: 'Grupo B', a: 11.2, b: 19.2, extra: 'R$ 19,4 mil' },
      { key: 'g3', label: 'Grupo C', a: 14.9, b: 15.8, extra: 'R$ 12,0 mil' },
      { key: 'g4', label: 'Grupo D', a: 9.9, b: 6.3, extra: 'R$ 7,2 mil' },
      { key: 'g5', label: 'Grupo E', a: 52.9, b: 27.2, extra: 'R$ 5,8 mil' },
    ],
    labelA: 'Contemplados',
    labelB: 'Recursos',
    corA: colorScales.blue[2],
    corB: colorScales.purple[2],
    title: 'Participação nos contemplados e nos recursos, por grupo',
    subtitle: 'Cada linha liga a participação do grupo nas duas medidas (%)',
    extraTitulo: 'Valor médio por contemplado',
    source: 'Fonte: dados ilustrativos.',
    background: '#ffffff',
  };

  const { Story } = defineMeta({
    title: 'Charts/Figuras/Halteres',
    component: HalteresChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: DEFAULT,
  });

  type StoryArgs = ComponentProps<typeof HalteresChart>;
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    <HalteresChart {...args} />
  </StoryFrame>
{/snippet}

<!-- `template as never`: o `Snippet` do addon e o do Svelte não se unificam no svelte-check, então um snippet bem tipado ainda é recusado. O cast fica só na entrega; o snippet segue tipado. -->

<Story name="Padrão" args={{}} template={template as never} />

<!-- A diferença b − a escrita sobre o traço. -->
<Story name="Com diferença" args={{ formatDiff: (d: number) => `${d > 0 ? "+" : ""}${d.toFixed(1)} p.p.` }} template={template as never} />
