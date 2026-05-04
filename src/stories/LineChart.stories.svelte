<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LineChart from '../lib/components/LineChart.svelte';
  import { blue, orange, teal, yellow, purple, lime, red, lavender } from '../lib/tokens.js';

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
      { name: 'Blue',     color: blue,     data: monthLabels.map((label, i) => ({ label, value: [42, 78, 55, 91, 63, 110][i] })) },
      { name: 'Orange',   color: orange,   data: monthLabels.map((label, i) => ({ label, value: [30, 50, 70, 60, 80,  95][i] })) },
      { name: 'Teal',     color: teal,     data: monthLabels.map((label, i) => ({ label, value: [60, 45, 80, 35, 95,  50][i] })) },
      { name: 'Yellow',   color: yellow,   data: monthLabels.map((label, i) => ({ label, value: [20, 65, 40, 85, 55, 100][i] })) },
      { name: 'Purple',   color: purple,   data: monthLabels.map((label, i) => ({ label, value: [75, 30, 90, 50, 70,  40][i] })) },
      { name: 'Lime',     color: lime,     data: monthLabels.map((label, i) => ({ label, value: [50, 85, 25, 75, 45,  90][i] })) },
      { name: 'Red',      color: red,      data: monthLabels.map((label, i) => ({ label, value: [35, 60, 95, 20, 65,  80][i] })) },
      { name: 'Lavender', color: lavender, data: monthLabels.map((label, i) => ({ label, value: [90, 40, 65, 30, 85,  55][i] })) },
    ],
    width: 700,
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
