<script module lang="ts">
  import type { ComponentProps } from 'svelte';
  import { defineMeta, type StoryContext } from '@storybook/addon-svelte-csf';
  import DispersaoLogChart from '$lib/components/figuras/DispersaoLogChart.svelte';
  import StoryFrame from '$lib/components/eixo1/StoryFrame.svelte';
  import { colorScales } from '$lib/tokens';

  /** Duas medidas que se multiplicam: as isolinhas são o produto constante. */
  const DEFAULT = {
    pontos: [
      { key: 'a', label: 'Cidade A', x: 610, y: 182700 },
      { key: 'b', label: 'Cidade B', x: 454, y: 114300 },
      { key: 'c', label: 'Cidade C', x: 700, y: 13000 },
      { key: 'd', label: 'Cidade D', x: 584, y: 40700 },
      { key: 'e', label: 'Cidade E', x: 112, y: 200200 },
      { key: 'f', label: 'Cidade F', x: 366, y: 52700 },
      { key: 'g', label: 'Cidade G', x: 144, y: 50000 },
      { key: 'h', label: 'Cidade H', x: 83, y: 41600 },
    ],
    dominioX: [50, 1000] as [number, number],
    dominioY: [10000, 300000] as [number, number],
    tituloX: 'Contemplados',
    tituloY: 'Valor médio por contemplado',
    formatX: (v: number) => v.toLocaleString('pt-BR'),
    formatY: (v: number) => `R$ ${v / 1000} mil`,
    isolinhas: [
      { valor: 5e6, label: 'R$ 5 mi' },
      { valor: 25e6, label: 'R$ 25 mi' },
      { valor: 100e6, label: 'R$ 100 mi' },
    ],
    cor: colorScales.purple[2],
    title: 'Contemplados e valor médio por cidade',
    subtitle: 'Escalas logarítmicas; cada diagonal é um recurso total constante',
    source: 'Fonte: dados ilustrativos.',
    background: '#ffffff',
  };

  const { Story } = defineMeta({
    title: 'Charts/Figuras/Dispersão log-log',
    component: DispersaoLogChart,
    tags: ['autodocs'],
    parameters: { layout: 'padded' },
    args: DEFAULT,
  });

  type StoryArgs = ComponentProps<typeof DispersaoLogChart>;
</script>

{#snippet template(args: StoryArgs, ctx: StoryContext<StoryArgs>)}
  <StoryFrame name={ctx.id}>
    <DispersaoLogChart {...args} />
  </StoryFrame>
{/snippet}

<!-- `template as never`: ver a nota em src/stories/eixo1/CaboGuerraMunicipalChart.stories.svelte. -->

<Story name="Padrão" args={{}} template={template as never} />

<!-- Um destaque num vão do painel, com os pontos de que ele fala preenchidos. -->
<Story name="Com anotação" args={{ anotacao: { largura: 190, destaques: ["c", "a"], itens: [
  { valor: "R$ 13,0 mil", texto: "em média na Cidade C, a de mais contemplados", cor: colorScales.purple[2] },
  { valor: "R$ 182,7 mil", texto: "em média na Cidade A", cor: colorScales.purple[2] },
] } }} template={template as never} />
