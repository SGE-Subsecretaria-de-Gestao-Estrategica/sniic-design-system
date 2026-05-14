<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import HorizontalBarChart from '../lib/components/HorizontalBarChart.svelte';
  import { colors } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/HorizontalBarChart',
    component: HorizontalBarChart,
    tags: ['autodocs'],
    argTypes: {
      color: { control: 'color' },
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
    color: colors.primary[0],
    xLabel: 'Sales',
  }}
/>

<Story
  name="With Format"
  args={{
    data: [
      { label: 'Product A', value: 45000 },
      { label: 'Product B', value: 32000 },
      { label: 'Product C', value: 28000 },
      { label: 'Product D', value: 19000 },
      { label: 'Product E', value: 12000 },
    ],
    color: colors.accent[0],
    format: (v) => `$${(v / 1000).toFixed(0)}k`,
    xLabel: 'Revenue',
  }}
/>

<Story
  name="Few Items"
  args={{
    data: [
      { label: 'Category A', value: 80 },
      { label: 'Category B', value: 45 },
      { label: 'Category C', value: 30 },
    ],
    color: colors.primary[1],
    rowHeight: 48,
  }}
/>
