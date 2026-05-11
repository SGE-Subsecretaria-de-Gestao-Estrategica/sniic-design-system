<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SlopeGraph from '../lib/components/SlopeGraph.svelte';
  import { blue, orange, teal, yellow, purple, lime } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/SlopeGraph',
    component: SlopeGraph,
    tags: ['autodocs'],
    argTypes: {
      showValues: { control: 'boolean' },
      strokeWidth: { control: { type: 'range', min: 1, max: 6, step: 0.5 } },
      dotRadius:   { control: { type: 'range', min: 2, max: 10, step: 1 } },
      width:       { control: { type: 'range', min: 300, max: 900, step: 50 } },
      height:      { control: { type: 'range', min: 200, max: 700, step: 50 } },
    },
  });
</script>

<Story
  name="Default"
  args={{
    startLabel: '2019',
    endLabel: '2024',
    width: 600,
    height: 400,
    showValues: true,
    strokeWidth: 2,
    dotRadius: 5,
    items: [
      { name: 'São Paulo',       startValue: 82, endValue: 91 },
      { name: 'Rio de Janeiro',  startValue: 74, endValue: 68 },
      { name: 'Belo Horizonte',  startValue: 61, endValue: 79 },
      { name: 'Salvador',        startValue: 55, endValue: 63 },
      { name: 'Fortaleza',       startValue: 48, endValue: 72 },
    ],
  }}
/>

<Story
  name="Custom Colors"
  args={{
    startLabel: 'Before',
    endLabel: 'After',
    width: 600,
    height: 400,
    showValues: true,
    items: [
      { name: 'Category A', color: blue,   startValue: 30, endValue: 75 },
      { name: 'Category B', color: orange, startValue: 60, endValue: 45 },
      { name: 'Category C', color: teal,   startValue: 45, endValue: 80 },
      { name: 'Category D', color: yellow, startValue: 70, endValue: 55 },
      { name: 'Category E', color: purple, startValue: 20, endValue: 65 },
      { name: 'Category F', color: lime,   startValue: 50, endValue: 40 },
    ],
  }}
/>

<Story
  name="Formatted Values"
  args={{
    startLabel: '2020',
    endLabel: '2025',
    width: 600,
    height: 420,
    showValues: true,
    format: (v) => `R$ ${v.toLocaleString('pt-BR')}`,
    items: [
      { name: 'Norte',      startValue: 1200, endValue: 1850 },
      { name: 'Nordeste',   startValue: 980,  endValue: 1420 },
      { name: 'Centro-Oeste', startValue: 2100, endValue: 2600 },
      { name: 'Sudeste',    startValue: 3200, endValue: 3900 },
      { name: 'Sul',        startValue: 2800, endValue: 3100 },
    ],
  }}
/>

<Story
  name="Names Only"
  args={{
    startLabel: 'Q1',
    endLabel: 'Q4',
    width: 600,
    height: 360,
    showValues: false,
    items: [
      { name: 'Product A', startValue: 40, endValue: 90 },
      { name: 'Product B', startValue: 85, endValue: 60 },
      { name: 'Product C', startValue: 55, endValue: 75 },
      { name: 'Product D', startValue: 30, endValue: 50 },
    ],
  }}
/>
