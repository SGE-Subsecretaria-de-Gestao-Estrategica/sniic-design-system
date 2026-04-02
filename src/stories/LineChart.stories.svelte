<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LineChart from '../lib/components/LineChart.svelte';
  import { colors } from '../lib/tokens.js';

  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const { Story } = defineMeta({
    title: 'Charts/LineChart',
    component: LineChart,
    tags: ['autodocs'],
    argTypes: {
      showDots: { control: 'boolean' },
      smooth:   { control: 'boolean' },
      width:    { control: { type: 'range', min: 300, max: 900, step: 50 } },
      height:   { control: { type: 'range', min: 200, max: 600, step: 50 } },
    },
  });
</script>

<Story
  name="Single Series"
  args={{
    series: [{
      name: 'Revenue',
      data: monthLabels.map((label, i) => ({ label, value: [42, 78, 55, 91, 63, 110][i] })),
    }],
    width: 600,
    height: 400,
    xLabel: 'Month',
    yLabel: 'Revenue ($k)',
    showDots: true,
    smooth: true,
  }}
/>

<Story
  name="Multi Series"
  args={{
    series: [
      {
        name: 'Product A',
        color: colors.primary[0],
        data: monthLabels.map((label, i) => ({ label, value: [42, 78, 55, 91, 63, 110][i] })),
      },
      {
        name: 'Product B',
        color: colors.accent[0],
        data: monthLabels.map((label, i) => ({ label, value: [30, 50, 70, 60, 80, 95][i] })),
      },
    ],
    width: 600,
    height: 400,
    xLabel: 'Month',
    yLabel: 'Units',
    showDots: true,
    smooth: true,
  }}
/>

<Story
  name="No Dots / Sharp Lines"
  args={{
    series: [{
      name: 'Sessions',
      data: monthLabels.map((label, i) => ({ label, value: [100, 200, 150, 300, 250, 400][i] })),
    }],
    showDots: false,
    smooth: false,
  }}
/>
