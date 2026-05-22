<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import StatesSilhouetteChart from '../lib/components/StatesSilhouetteChart.svelte';

  const { Story } = defineMeta({
    title: 'Charts/StatesSilhouetteChart',
    component: StatesSilhouetteChart,
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
      { state: 'SP', value: 4200 },
      { state: 'MG', value: 2800 },
      { state: 'RJ', value: 2100 },
      { state: 'BA', value: 1500 },
      { state: 'RS', value: 1200 },
      { state: 'PR', value: 1000 },
      { state: 'PE', value: 900 },
      { state: 'CE', value: 800 },
      { state: 'GO', value: 700 },
      { state: 'SC', value: 650 },
    ],
    maxSize: 80,
    format: (v) => v.toLocaleString('pt-BR'),
  }}
/>

<Story
  name="Todos os Estados"
  args={{
    data: [
      { state: 'SP', value: 4200 },
      { state: 'MG', value: 2800 },
      { state: 'RJ', value: 2100 },
      { state: 'BA', value: 1500 },
      { state: 'RS', value: 1200 },
      { state: 'PR', value: 1000 },
      { state: 'PE', value: 900 },
      { state: 'CE', value: 800 },
      { state: 'GO', value: 700 },
      { state: 'SC', value: 650 },
      { state: 'MA', value: 600 },
      { state: 'PA', value: 580 },
      { state: 'MT', value: 540 },
      { state: 'MS', value: 500 },
      { state: 'PI', value: 460 },
      { state: 'AM', value: 420 },
      { state: 'RN', value: 400 },
      { state: 'PB', value: 380 },
      { state: 'TO', value: 350 },
      { state: 'ES', value: 320 },
      { state: 'AL', value: 290 },
      { state: 'RO', value: 260 },
      { state: 'SE', value: 230 },
      { state: 'AC', value: 200 },
      { state: 'RR', value: 170 },
      { state: 'AP', value: 150 },
      { state: 'DF', value: 1800 },
    ],
    maxSize: 70,
    format: (v) => v.toLocaleString('pt-BR'),
  }}
/>

<Story
  name="Valor Investido"
  args={{
    data: [
      { state: 'SP', value: 820000000 },
      { state: 'RJ', value: 498000000 },
      { state: 'MG', value: 385000000 },
      { state: 'RS', value: 214000000 },
      { state: 'BA', value: 98000000 },
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
  name="No Labels"
  args={{
    data: [
      { state: 'SP', value: 4200 },
      { state: 'MG', value: 2800 },
      { state: 'RJ', value: 2100 },
      { state: 'BA', value: 1500 },
      { state: 'RS', value: 1200 },
    ],
    maxSize: 90,
    showLabels: false,
  }}
/>
