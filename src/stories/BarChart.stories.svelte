<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BarChart from '../lib/components/BarChart.svelte';
  import { colors } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/BarChart',
    component: BarChart,
    tags: ['autodocs'],
    argTypes: {
      color: { control: 'color' },
      width:  { control: { type: 'range', min: 300, max: 900, step: 50 } },
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
    width: 600,
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

<Story
  name="Small"
  args={{
    data: [
      { label: 'A', value: 30 },
      { label: 'B', value: 80 },
      { label: 'C', value: 45 },
    ],
    width: 320,
    height: 240,
    color: colors.primary[1],
  }}
/>
