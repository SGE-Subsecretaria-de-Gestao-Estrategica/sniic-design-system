<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import RegionSilhouetteChart from '../lib/components/RegionSilhouetteChart.svelte';
  import { colors } from '../lib/tokens.js';
  import { categorical8 } from '../lib/palettes.js';

  const { Story } = defineMeta({
    title: 'Charts/RegionSilhouetteChart',
    component: RegionSilhouetteChart,
    tags: ['autodocs'],
    argTypes: {
      maxSize: { control: { type: 'range', min: 40, max: 160, step: 10 } },
      showLabels: { control: 'boolean' },
    },
  });
</script>

<Story
  name="Projetos Culturais"
  args={{
    data: [
      { region: 'Sudeste',     value: 4200 },
      { region: 'Nordeste',    value: 2800 },
      { region: 'Sul',         value: 1500 },
      { region: 'CentroOeste', value: 900 },
      { region: 'Norte',       value: 600 },
    ],
    maxSize: 90,
    format: (v) => v.toLocaleString('pt-BR'),
  }}
/>

<Story
  name="Valor Investido"
  args={{
    data: [
      { region: 'Sudeste',     value: 820000000 },
      { region: 'Sul',         value: 498000000 },
      { region: 'Nordeste',    value: 385000000 },
      { region: 'CentroOeste', value: 214000000 },
      { region: 'Norte',       value: 98000000 },
    ],
    maxSize: 100,
    format: (v) =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(v),
  }}
/>

<Story
  name="Custom Colors"
  args={{
    data: [
      { region: 'Norte',       value: 600,  color: '#265c4f' },
      { region: 'Nordeste',    value: 2800, color: '#ea662f' },
      { region: 'CentroOeste', value: 900,  color: '#f6c341' },
      { region: 'Sudeste',     value: 4200, color: '#4271b5' },
      { region: 'Sul',         value: 1500, color: '#a44c7f' },
    ],
    maxSize: 90,
  }}
/>

<Story
  name="No Labels"
  args={{
    data: [
      { region: 'Sudeste',     value: 4200 },
      { region: 'Nordeste',    value: 2800 },
      { region: 'Sul',         value: 1500 },
      { region: 'CentroOeste', value: 900 },
      { region: 'Norte',       value: 600 },
    ],
    maxSize: 90,
    showLabels: false,
  }}
/>

<Story
  name="Small Size"
  args={{
    data: [
      { region: 'Sudeste',     value: 4200 },
      { region: 'Nordeste',    value: 2800 },
      { region: 'Sul',         value: 1500 },
      { region: 'CentroOeste', value: 900 },
      { region: 'Norte',       value: 600 },
    ],
    maxSize: 50,
  }}
/>
