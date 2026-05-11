<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import PyramidChart from '../lib/components/PyramidChart.svelte';
  import { blue, teal, orange } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/PyramidChart',
    component: PyramidChart,
    tags: ['autodocs'],
    argTypes: {
      height: { control: { type: 'range', min: 200, max: 600, step: 20 } },
      gap:    { control: { type: 'range', min: 0, max: 20, step: 1 } },
      showDifferences: { control: 'boolean' },
    },
  });
</script>

<Story
  name="Default"
  args={{
    tiers: [
      { label: 'Conscientização', value: 12000 },
      { label: 'Consideração',    value: 4800  },
      { label: 'Conversão',       value: 960   },
    ],
    height: 380,
    showDifferences: true,
  }}
/>

<Story
  name="Custom Colors"
  args={{
    tiers: [
      { label: 'Top',    value: 500,  color: blue   },
      { label: 'Middle', value: 2100, color: teal   },
      { label: 'Base',   value: 8700, color: orange },
    ],
    height: 380,
    showDifferences: true,
  }}
/>

<Story
  name="No Differences"
  args={{
    tiers: [
      { label: 'Visitantes',  value: 50000 },
      { label: 'Leads',       value: 8500  },
      { label: 'Clientes',    value: 1200  },
    ],
    height: 380,
    showDifferences: false,
  }}
/>
