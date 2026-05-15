<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CorrelationMatrix from '../lib/components/CorrelationMatrix.svelte';
  import { colorScales } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/CorrelationMatrix',
    component: CorrelationMatrix,
    tags: ['autodocs'],
    argTypes: {
      height:     { control: { type: 'range', min: 300, max: 700, step: 50 } },
      cellRadius: { control: { type: 'range', min: 0, max: 12, step: 1 } },
      cellGap:    { control: { type: 'range', min: 0, max: 10, step: 1 } },
      showValues: { control: 'boolean' },
      showLegend: { control: 'boolean' },
      xRotate:    { control: { type: 'range', min: -90, max: 0, step: 15 } },
    },
  });

  const vars = ['PIB', 'Emprego', 'Renda', 'Educação', 'Saúde', 'Cultura'];

  function makeCorrelation(variables, seed = 42) {
    const cells = [];
    let n = seed;
    for (const x of variables) {
      for (const y of variables) {
        if (x === y) {
          cells.push({ x, y, value: 1.0 });
        } else {
          n = (n * 1664525 + 1013904223) & 0xffffffff;
          const raw = (Math.abs(n) % 2000 - 1000) / 1000;
          cells.push({ x, y, value: Math.round(raw * 100) / 100 });
        }
      }
    }
    return cells;
  }
</script>

<Story
  name="Default"
  args={{
    height: 450,
    showValues: true,
    showLegend: true,
    data: makeCorrelation(vars),
  }}
/>

<Story
  name="Custom Colors"
  args={{
    height: 450,
    showValues: true,
    showLegend: true,
    negativeColor: colorScales.orange[2],
    positiveColor: colorScales.teal[2],
    data: makeCorrelation(vars, 7),
  }}
/>

<Story
  name="Large Matrix"
  args={{
    height: 500,
    showValues: true,
    showLegend: true,
    cellGap: 2,
    data: makeCorrelation([
      'PIB', 'Emprego', 'Renda', 'Educação', 'Saúde',
      'Cultura', 'Turismo', 'Habitação', 'Segurança', 'Transporte',
    ], 99),
  }}
/>
