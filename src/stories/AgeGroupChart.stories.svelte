<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AgeGroupChart from '../lib/components/AgeGroupChart.svelte';

  const { Story } = defineMeta({
    title: 'Charts/AgeGroupChart',
    component: AgeGroupChart,
    tags: ['autodocs'],
  });
</script>

<Story
  name="Default"
  args={{
    data: [
      { uf: 'SP', youth: 12000, adult: 28000, senior: 8000 },
      { uf: 'RJ', youth: 7500,  adult: 18000, senior: 5500 },
      { uf: 'MG', youth: 8200,  adult: 20000, senior: 6000 },
      { uf: 'BA', youth: 6800,  adult: 14000, senior: 3500 },
      { uf: 'RS', youth: 4200,  adult: 11000, senior: 4800 },
      { uf: 'PR', youth: 5100,  adult: 13000, senior: 3200 },
      { uf: 'PE', youth: 5600,  adult: 12000, senior: 2800 },
      { uf: 'CE', youth: 5800,  adult: 11500, senior: 2500 },
    ],
  }}
/>

<Story
  name="Youth Dominant"
  args={{
    data: [
      { uf: 'AM', youth: 9000, adult: 6000, senior: 1200 },
      { uf: 'PA', youth: 8500, adult: 5800, senior: 1000 },
      { uf: 'TO', youth: 3200, adult: 2400, senior: 500  },
      { uf: 'RO', youth: 2800, adult: 2200, senior: 400  },
      { uf: 'AC', youth: 2200, adult: 1800, senior: 300  },
      { uf: 'RR', youth: 1800, adult: 1400, senior: 250  },
    ],
  }}
/>

<Story
  name="Senior Dominant"
  args={{
    data: [
      { uf: 'RS', youth: 2000, adult: 10000, senior: 8000 },
      { uf: 'SC', youth: 2200, adult: 9500,  senior: 6500 },
      { uf: 'SP', youth: 4000, adult: 18000, senior: 12000 },
      { uf: 'RJ', youth: 3000, adult: 12000, senior: 9000 },
    ],
  }}
/>
