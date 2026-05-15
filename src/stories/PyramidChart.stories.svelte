<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PyramidChart from '../lib/components/PyramidChart.svelte';
  import { colorPairs } from '../lib/palettes.js';

  const { Story } = defineMeta({
    title: 'Charts/PyramidChart',
    component: PyramidChart,
    tags: ['autodocs'],
    argTypes: {
      height: { control: { type: 'range', min: 300, max: 600, step: 20 } },
      centerGap: { control: { type: 'range', min: 20, max: 80, step: 4 } },
    },
  });
</script>

<Story
  name="Population Pyramid"
  args={{
    data: [
      { label: '0–9',   left: 7200, right: 6900 },
      { label: '10–19', left: 8100, right: 7800 },
      { label: '20–29', left: 9500, right: 9200 },
      { label: '30–39', left: 10800, right: 10500 },
      { label: '40–49', left: 9200, right: 9600 },
      { label: '50–59', left: 7500, right: 8100 },
      { label: '60–69', left: 5200, right: 6000 },
      { label: '70–79', left: 2800, right: 3600 },
      { label: '80+',   left: 900,  right: 1500 },
    ],
    leftLabel: 'Masculino',
    rightLabel: 'Feminino',
    height: 460,
  }}
/>

<Story
  name="Custom Colors"
  args={{
    data: [
      { label: '0–14',  left: 22000, right: 21000 },
      { label: '15–29', left: 25000, right: 24500 },
      { label: '30–44', left: 28000, right: 27000 },
      { label: '45–59', left: 21000, right: 22500 },
      { label: '60–74', left: 14000, right: 16000 },
      { label: '75+',   left: 5000,  right: 7500  },
    ],
    leftLabel: 'Homens',
    rightLabel: 'Mulheres',
    colors: colorPairs.orangeTeal,
    height: 400,
  }}
/>
