<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChartTitleDemo from './_ChartTitleDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/ChartTitle',
    component: ChartTitleDemo,
    tags: ['autodocs'],
    argTypes: {
      fontSize: { control: { type: 'range', min: 10, max: 24, step: 1 } },
      color:    { control: 'color' },
      anchor:   { control: 'select', options: ['start', 'middle', 'end'] },
    },
  });
</script>

<Story
  name="Default"
  args={{
    text: 'Distribuicao por Regiao',
    fontSize: 16,
    anchor: 'start',
  }}
/>

<Story
  name="Centered"
  args={{
    text: 'Evolucao Anual',
    fontSize: 18,
    anchor: 'middle',
  }}
/>

<Story
  name="Right-aligned"
  args={{
    text: 'Fonte: IBGE 2024',
    fontSize: 12,
    color: '#94a3b8',
    anchor: 'end',
  }}
/>
