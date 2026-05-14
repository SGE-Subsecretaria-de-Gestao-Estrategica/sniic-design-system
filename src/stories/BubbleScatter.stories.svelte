<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BubbleChart from '../lib/components/BubbleChart.svelte';

  const allData = [
    { label: 'São Paulo',          x: 46000000, y: 820000000, size: 420, group: 'Sudeste' },
    { label: 'Rio de Janeiro',     x: 17000000, y: 310000000, size: 180, group: 'Sudeste' },
    { label: 'Minas Gerais',       x: 21000000, y: 280000000, size: 160, group: 'Sudeste' },
    { label: 'Bahia',              x: 14800000, y: 210000000, size: 130, group: 'Nordeste' },
    { label: 'Paraná',             x: 11400000, y: 190000000, size: 95,  group: 'Sul' },
    { label: 'Rio Grande do Sul',  x: 11400000, y: 175000000, size: 88,  group: 'Sul' },
    { label: 'Pernambuco',         x: 9600000,  y: 145000000, size: 72,  group: 'Nordeste' },
    { label: 'Ceará',              x: 9200000,  y: 120000000, size: 68,  group: 'Nordeste' },
    { label: 'Pará',               x: 8700000,  y: 98000000,  size: 52,  group: 'Norte' },
    { label: 'Maranhão',           x: 7100000,  y: 72000000,  size: 38,  group: 'Nordeste' },
    { label: 'Goiás',              x: 7100000,  y: 88000000,  size: 45,  group: 'Centro-Oeste' },
    { label: 'Amazonas',           x: 4200000,  y: 58000000,  size: 30,  group: 'Norte' },
    { label: 'Espírito Santo',     x: 4100000,  y: 65000000,  size: 35,  group: 'Sudeste' },
    { label: 'Distrito Federal',   x: 3000000,  y: 78000000,  size: 42,  group: 'Centro-Oeste' },
  ];

  const BRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const NUM = new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const { Story } = defineMeta({
    title: 'Charts/BubbleChart',
    component: BubbleChart,
    tags: ['autodocs'],
  });
</script>

<Story
  name="With Groups (Log Scale)"
  args={{
    data: allData,
    xLabel: 'População total (escala log)',
    yLabel: 'Valor recebido (escala log)',
    sizeLabel: 'Tamanho da bolha = nº de projetos',
    xScaleType: 'log',
    yScaleType: 'log',
    xFormat: (v) => NUM.format(v),
    yFormat: (v) => BRL.format(v),
    groups: {
      Norte: '#4f8c4e',
      Nordeste: '#ecb42d',
      'Centro-Oeste': '#d97b2a',
      Sudeste: '#3a7bd5',
      Sul: '#d2301d',
    },
  }}
/>

<Story
  name="Linear Scale"
  args={{
    data: allData,
    xLabel: 'Population',
    yLabel: 'Revenue',
    sizeLabel: 'Number of projects',
    xScaleType: 'linear',
    yScaleType: 'linear',
    xFormat: (v) => NUM.format(v),
    yFormat: (v) => BRL.format(v),
  }}
/>

<Story
  name="Simple (No Groups)"
  args={{
    data: [
      { label: 'Product A', x: 100, y: 5000, size: 30 },
      { label: 'Product B', x: 250, y: 8000, size: 45 },
      { label: 'Product C', x: 180, y: 3000, size: 60 },
      { label: 'Product D', x: 400, y: 12000, size: 25 },
      { label: 'Product E', x: 320, y: 9500, size: 80 },
    ],
    xLabel: 'Units Sold',
    yLabel: 'Revenue ($)',
    sizeLabel: 'Market Share',
  }}
/>
