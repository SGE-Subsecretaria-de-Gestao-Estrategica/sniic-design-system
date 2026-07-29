<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import VerticalBarChart from '../lib/components/VerticalBarChart.svelte';
  import { colors } from '../lib/tokens.js';
  import { getPillarTheme } from '../lib/core/theme/index.js';

  const { Story } = defineMeta({
    title: 'Charts/VerticalBarChart',
    component: VerticalBarChart,
    tags: ['autodocs'],
    argTypes: {
      color: { control: 'color' },
      height: { control: { type: 'range', min: 200, max: 600, step: 50 } },
    },
  });
</script>

<Story
  name="Default"
  args={{
    data: [
      { label: 'Jan', value: 42 },
      { label: 'Feb', value: 78 },
      { label: 'Mar', value: 55 },
      { label: 'Apr', value: 91 },
      { label: 'May', value: 63 },
      { label: 'Jun', value: 110 },
    ],
    height: 400,
    color: colors.primary[0],
    xLabel: 'Month',
    yLabel: 'Sales',
  }}
/>

<Story
  name="Accent Color"
  args={{
    data: [
      { label: 'Q1', value: 120 },
      { label: 'Q2', value: 85 },
      { label: 'Q3', value: 145 },
      { label: 'Q4', value: 200 },
    ],
    color: colors.accent[0],
    xLabel: 'Quarter',
    yLabel: 'Revenue ($k)',
  }}
/>

<!-- Post-migration capabilities: bar fill comes from the theme (no `color`
     prop) and the SVG can take a fixed width instead of tracking its box. -->
<Story
  name="Themed / Fixed Width"
  args={{
    data: [
      { label: 'Norte', value: 120 },
      { label: 'Nordeste', value: 310 },
      { label: 'Centro-Oeste', value: 150 },
      { label: 'Sudeste', value: 480 },
      { label: 'Sul', value: 290 },
    ],
    theme: getPillarTheme(1),
    responsive: false,
    width: 560,
    height: 340,
    xLabel: 'Região',
    yLabel: 'Equipamentos',
  }}
/>

<Story
  name="Small"
  args={{
    data: [
      { label: 'A', value: 30 },
      { label: 'B', value: 80 },
      { label: 'C', value: 45 },
    ],
    height: 240,
    color: colors.primary[1],
  }}
/>
