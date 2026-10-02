<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import PainelMetricasChart from '$lib/components/figuras/PainelMetricasChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';
  import { colorScales } from '$lib/tokens';

  const brl = (v: number) => `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}`;

  /** Uma linha por categoria, uma coluna por métrica, cada coluna na sua escala. */
  const DEFAULT = {
    colunas: [
      { key: 'total', label: 'Recurso (R$ mi)', cor: colorScales.purple[2], formatValue: brl },
      { key: 'medio', label: 'Valor médio (R$ mil)', cor: colorScales.purple[2], formatValue: brl, referencia: { valor: 21, label: 'Brasil 21,0' } },
      { key: 'capita', label: 'Per capita (R$)', cor: colorScales.purple[2], formatValue: brl, referencia: { valor: 20.58, label: 'Brasil 20,58' } },
    ],
    linhas: [
      { key: 'no', label: 'Norte', valores: { total: 482.4, medio: 28.8, capita: 27.79 } },
      { key: 'ne', label: 'Nordeste', valores: { total: 1278.4, medio: 13.7, capita: 23.39 } },
      { key: 'se', label: 'Sudeste', valores: { total: 1549.8, medio: 27.5, capita: 18.27 } },
      { key: 'su', label: 'Sul', valores: { total: 557.6, medio: 25.4, capita: 18.62 } },
      { key: 'co', label: 'Centro-Oeste', valores: { total: 311.3, medio: 28.5, capita: 19.11 } },
    ],
    title: 'Recurso, valor médio e valor per capita por região',
    subtitle: 'Cada coluna na sua própria escala; a linha tracejada marca a referência',
    source: 'Fonte: dados ilustrativos.',
    background: '#ffffff',
  };

  const { Story } = defineMeta({
    title: 'LPG/Figuras/Painel de métricas',
    component: PainelMetricasChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: DEFAULT,
  });

  type StoryArgs = ComponentProps<typeof PainelMetricasChart>;
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    <PainelMetricasChart {...args} />
  </StoryFrame>
{/snippet}

<!-- `template as never`: o `Snippet` do addon e o do Svelte não se unificam no svelte-check, então um snippet bem tipado ainda é recusado. O cast fica só na entrega; o snippet segue tipado. -->

<Story name="Padrão" args={{}} template={template as never} />

<!-- A cor do texto escuro é um prop: aqui, o cinza das figuras da LPG. -->
<Story name="Texto cinza" args={{ corTexto: "#4A4A45" }} template={template as never} />
