<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import VerticalStackedBarChart from '../lib/components/VerticalStackedBarChart.svelte';

  const { Story } = defineMeta({
    title: 'Charts/VerticalStackedBarChart',
    component: VerticalStackedBarChart,
    tags: ['autodocs'],
  });
</script>

<Story
  name="Age Groups (Normalized)"
  args={{
    data: [
      { label: 'SP', youth: 12000, adult: 28000, senior: 8000 },
      { label: 'RJ', youth: 7500,  adult: 18000, senior: 5500 },
      { label: 'MG', youth: 8200,  adult: 20000, senior: 6000 },
      { label: 'BA', youth: 6800,  adult: 14000, senior: 3500 },
      { label: 'RS', youth: 4200,  adult: 11000, senior: 4800 },
      { label: 'PR', youth: 5100,  adult: 13000, senior: 3200 },
      { label: 'PE', youth: 5600,  adult: 12000, senior: 2800 },
      { label: 'CE', youth: 5800,  adult: 11500, senior: 2500 },
    ],
    keys: ['youth', 'adult', 'senior'],
    labels: { youth: '15–29 anos', adult: '30–59 anos', senior: '60+ anos' },
    normalize: true,
    sortBy: 'youth',
  }}
/>

<Story
  name="Absolute Values"
  args={{
    data: [
      { label: 'SP', youth: 12000, adult: 28000, senior: 8000 },
      { label: 'RJ', youth: 7500,  adult: 18000, senior: 5500 },
      { label: 'MG', youth: 8200,  adult: 20000, senior: 6000 },
      { label: 'BA', youth: 6800,  adult: 14000, senior: 3500 },
    ],
    keys: ['youth', 'adult', 'senior'],
    labels: { youth: 'Youth', adult: 'Adult', senior: 'Senior' },
    normalize: false,
  }}
/>

<Story
  name="Auto-detect Keys"
  args={{
    data: [
      { label: 'Q1', revenue: 5000, costs: 3200, profit: 1800 },
      { label: 'Q2', revenue: 6200, costs: 3800, profit: 2400 },
      { label: 'Q3', revenue: 5800, costs: 3500, profit: 2300 },
      { label: 'Q4', revenue: 7100, costs: 4100, profit: 3000 },
    ],
  }}
/>
