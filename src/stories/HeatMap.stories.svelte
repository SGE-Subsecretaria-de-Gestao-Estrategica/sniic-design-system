<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import HeatMap from '../lib/components/HeatMap.svelte';
  import { colorScales } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/HeatMap',
    component: HeatMap,
    tags: ['autodocs'],
    argTypes: {
      height:      { control: { type: 'range', min: 200, max: 700, step: 50 } },
      cellRadius:  { control: { type: 'range', min: 0, max: 12, step: 1 } },
      showValues:  { control: 'boolean' },
      showLegend:  { control: 'boolean' },
      xRotate:     { control: { type: 'range', min: -90, max: 0, step: 15 } },
    },
  });

  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const states = ['SP', 'RJ', 'MG', 'BA', 'RS', 'PR', 'PE', 'CE'];

  function makeGrid(rows, cols, seed = 1) {
    const cells = [];
    let n = seed;
    for (const row of rows) {
      for (const col of cols) {
        n = (n * 1664525 + 1013904223) & 0xffffffff;
        cells.push({ y: row, x: col, value: Math.abs(n % 100) });
      }
    }
    return cells;
  }
</script>

<Story
  name="Default"
  args={{
    height: 400,
    cellRadius: 3,
    showValues: false,
    showLegend: true,
    data: makeGrid(states, months),
  }}
/>

<Story
  name="With Values"
  args={{
    height: 400,
    cellRadius: 3,
    showValues: true,
    showLegend: true,
    format: (v) => `${v}%`,
    data: makeGrid(states, months, 42),
  }}
/>

<Story
  name="Orange Scale"
  parameters={{ backgrounds: { default: 'light' } }}
  args={{
    height: 400,
    cellRadius: 3,
    showValues: false,
    showLegend: true,
    colorRange: colorScales.orange,
    data: makeGrid(states, months, 7),
  }}
/>

<Story
  name="Rotated X Labels"
  args={{
    height: 420,
    cellRadius: 3,
    showValues: false,
    showLegend: true,
    xRotate: -45,
    data: makeGrid(
      ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'],
      ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      99,
    ),
  }}
/>

<Story
  name="Small Grid"
  args={{
    height: 300,
    cellRadius: 6,
    showValues: true,
    showLegend: true,
    colorRange: colorScales.teal,
    format: (v) => String(v),
    data: makeGrid(['A', 'B', 'C', 'D'], ['W', 'X', 'Y', 'Z'], 3),
  }}
/>
