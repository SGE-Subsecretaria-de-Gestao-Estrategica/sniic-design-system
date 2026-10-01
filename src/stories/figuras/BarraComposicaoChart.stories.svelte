<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import BarraComposicaoChart from '$lib/components/figuras/BarraComposicaoChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';
  import { colorScales } from '$lib/tokens';

  const keys = ['baixa', 'media', 'alta'];

  /** Barras 100%: cada linha repartida entre as mesmas três parcelas. */
  const DEFAULT = {
    data: [
      { label: 'Norte', baixa: 48, media: 37, alta: 15 },
      { label: 'Nordeste', baixa: 55, media: 33, alta: 12 },
      { label: 'Sudeste', baixa: 30, media: 42, alta: 28 },
      { label: 'Sul', baixa: 34, media: 44, alta: 22 },
      { label: 'Centro-Oeste', baixa: 38, media: 40, alta: 22 },
    ],
    keys,
    labels: { baixa: 'Faixa baixa', media: 'Faixa média', alta: 'Faixa alta' },
    colors: [colorScales.blue[2], '#7a5f9c', colorScales.purple[2]],
    title: 'Distribuição por faixa, por região',
    subtitle: 'Participação de cada faixa no total da região (%)',
    formatValue: (v: number) => `${Math.round(v)}%`,
    divisoria: true,
    source: 'Fonte: dados ilustrativos.',
    background: '#ffffff',
  };

  const { Story } = defineMeta({
    title: 'Charts/Figuras/Barra de composição',
    component: BarraComposicaoChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: DEFAULT,
  });

  type StoryArgs = ComponentProps<typeof BarraComposicaoChart>;
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    <BarraComposicaoChart {...args} />
  </StoryFrame>
{/snippet}

<!-- `template as never`: o `Snippet` do addon e o do Svelte não se unificam no svelte-check, então um snippet bem tipado ainda é recusado. O cast fica só na entrega; o snippet segue tipado. -->

<Story name="Padrão" args={{}} template={template as never} />

<!-- Pares de barras encostadas: `grupo` junta as linhas de uma mesma região. -->
<Story name="Agrupada" args={{ data: [
  { label: "Contemplados", grupo: "Norte", baixa: 48, media: 37, alta: 15 },
  { label: "Recursos", grupo: "Norte", baixa: 10, media: 35, alta: 55 },
  { label: "Contemplados", grupo: "Sul", baixa: 34, media: 44, alta: 22 },
  { label: "Recursos", grupo: "Sul", baixa: 8, media: 38, alta: 54 },
] }} template={template as never} />
