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
      dotRadius:   { control: { type: 'range', min: 2, max: 14, step: 1 } },
      fontSize:    { control: { type: 'range', min: 10, max: 20, step: 1 } },
      width:       { control: { type: 'range', min: 300, max: 1100, step: 50 } },
      height:      { control: { type: 'range', min: 200, max: 700, step: 50 } },
    },
  });
</script>

<Story
  name="Default"
  args={{
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    width: 800,
    height: 480,
    showValues: true,
    items: [
      { name: 'São Paulo',       values: [82, 84, 86, 88, 90, 91] },
      { name: 'Rio de Janeiro',  values: [74, 73, 71, 70, 69, 68] },
      { name: 'Belo Horizonte',  values: [61, 64, 68, 72, 76, 79] },
      { name: 'Salvador',        values: [55, 56, 58, 59, 61, 63] },
      { name: 'Fortaleza',       values: [48, 52, 57, 62, 67, 72] },
    ],
  }}
/>

<Story
  name="Custom Colors"
  args={{
    labels: ['2020', '2021', '2022', '2023', '2024'],
    width: 800,
    height: 480,
    showValues: true,
    items: [
      { name: 'Category A', color: blue,   values: [30, 42, 55, 65, 75] },
      { name: 'Category B', color: orange, values: [60, 58, 52, 48, 45] },
      { name: 'Category C', color: teal,   values: [45, 52, 60, 70, 80] },
      { name: 'Category D', color: yellow, values: [70, 68, 63, 58, 55] },
      { name: 'Category E', color: purple, values: [20, 30, 40, 52, 65] },
      { name: 'Category F', color: lime,   values: [50, 48, 46, 43, 40] },
    ],
  }}
/>

<Story
  name="Formatted Values"
  args={{
    labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
    width: 850,
    height: 500,
    showValues: true,
    format: (v) => `R$ ${v.toLocaleString('pt-BR')}`,
    items: [
      { name: 'Norte',        values: [1200, 1320, 1450, 1580, 1720, 1850] },
      { name: 'Nordeste',     values: [980, 1050, 1130, 1220, 1320, 1420] },
      { name: 'Centro-Oeste', values: [2100, 2200, 2310, 2420, 2510, 2600] },
      { name: 'Sudeste',      values: [3200, 3340, 3480, 3620, 3760, 3900] },
      { name: 'Sul',          values: [2800, 2860, 2930, 2990, 3050, 3100] },
    ],
  }}
/>

<Story
  name="Two Columns"
  args={{
    labels: ['Q1', 'Q4'],
    width: 600,
    height: 400,
    showValues: true,
    items: [
      { name: 'Product A', values: [40, 90] },
      { name: 'Product B', values: [85, 60] },
      { name: 'Product C', values: [55, 75] },
      { name: 'Product D', values: [30, 50] },
    ],
  }}
/>

<Story
  name="Names Only"
  args={{
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    width: 700,
    height: 420,
    showValues: false,
    items: [
      { name: 'Product A', values: [40, 55, 70, 90] },
      { name: 'Product B', values: [85, 78, 68, 60] },
      { name: 'Product C', values: [55, 60, 68, 75] },
      { name: 'Product D', values: [30, 35, 42, 50] },
    ],
  }}
/>
