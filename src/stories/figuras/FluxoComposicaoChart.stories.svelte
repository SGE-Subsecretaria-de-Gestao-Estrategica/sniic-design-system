<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import FluxoComposicaoChart, { type BarraFluxo } from '$lib/components/figuras/FluxoComposicaoChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';
  import { colorScales } from '$lib/tokens';

  const categorias = [
    { key: 'estado', label: 'Estados' },
    { key: 'municipio', label: 'Municípios' },
  ];

  /** Duas repartições do mesmo todo, ligadas categoria a categoria. */
  const DEFAULT = {
    categorias,
    barras: [
      { label: 'Contemplados', cor: colorScales.blue[2], valores: { estado: 23199, municipio: 176251 }, detalhes: { estado: '23.199', municipio: '176.251' } },
      { label: 'Recursos', cor: colorScales.purple[2], valores: { estado: 2.19e9, municipio: 1.99e9 }, detalhes: { estado: 'R$ 2,19 bi', municipio: 'R$ 1,99 bi' } },
    ] as [BarraFluxo, BarraFluxo],
    title: 'Contemplados e recursos por tipo de ente',
    subtitle: 'Participação de cada ente no total de contemplados e no total de recursos (%)',
    formatValue: (v: number) => `${v.toFixed(1).replace('.', ',')}%`,
    source: 'Fonte: dados ilustrativos.',
    background: '#ffffff',
  };

  const { Story } = defineMeta({
    title: 'Charts/Figuras/Fluxo de composição',
    component: FluxoComposicaoChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: DEFAULT,
  });

  type StoryArgs = ComponentProps<typeof FluxoComposicaoChart>;
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    <FluxoComposicaoChart {...args} />
  </StoryFrame>
{/snippet}

<!-- `template as never`: o `Snippet` do addon e o do Svelte não se unificam no svelte-check, então um snippet bem tipado ainda é recusado. O cast fica só na entrega; o snippet segue tipado. -->

<Story name="Padrão" args={{}} template={template as never} />

<!-- Um destaque sob cada categoria. -->
<Story name="Com notas" args={{ notas: { estado: { valor: "R$ 94,5 mil", texto: "é o valor médio por contemplado" }, municipio: { valor: "R$ 11,3 mil", texto: "é o valor médio por contemplado" } } }} template={template as never} />
