<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import HorizontalStackedBarChart from '../lib/components/HorizontalStackedBarChart.svelte';

  const BRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const fullData = [
    { label: 'São Paulo',          audiovisual: 320000000, demais: 500000000 },
    { label: 'Rio de Janeiro',     audiovisual: 180000000, demais: 130000000 },
    { label: 'Minas Gerais',       audiovisual: 90000000,  demais: 190000000 },
    { label: 'Bahia',              audiovisual: 75000000,  demais: 135000000 },
    { label: 'Paraná',             audiovisual: 65000000,  demais: 125000000 },
    { label: 'Rio Grande do Sul',  audiovisual: 60000000,  demais: 115000000 },
    { label: 'Pernambuco',         audiovisual: 55000000,  demais: 90000000  },
    { label: 'Ceará',              audiovisual: 48000000,  demais: 72000000  },
    { label: 'Santa Catarina',     audiovisual: 42000000,  demais: 106000000 },
    { label: 'Goiás',              audiovisual: 35000000,  demais: 53000000  },
    { label: 'Pará',               audiovisual: 30000000,  demais: 68000000  },
    { label: 'Distrito Federal',   audiovisual: 28000000,  demais: 50000000  },
    { label: 'Espírito Santo',     audiovisual: 22000000,  demais: 43000000  },
    { label: 'Mato Grosso',        audiovisual: 18000000,  demais: 34000000  },
    { label: 'Amazonas',           audiovisual: 16000000,  demais: 42000000  },
  ];

  const { Story } = defineMeta({
    title: 'Charts/HorizontalStackedBarChart',
    component: HorizontalStackedBarChart,
    tags: ['autodocs'],
  });
</script>

<Story
  name="All States"
  args={{
    data: fullData,
    keys: ['audiovisual', 'demais'],
    labels: { audiovisual: 'Audiovisual', demais: 'Demais Áreas' },
    format: (v) => BRL.format(v),
  }}
/>

<Story
  name="Top 5"
  args={{
    data: fullData.slice(0, 5),
    keys: ['audiovisual', 'demais'],
    labels: { audiovisual: 'Audiovisual', demais: 'Demais Áreas' },
    format: (v) => BRL.format(v),
  }}
/>

<Story
  name="Generic Data"
  args={{
    data: [
      { label: 'Product A', online: 4500, retail: 3200 },
      { label: 'Product B', online: 3800, retail: 4100 },
      { label: 'Product C', online: 2900, retail: 2200 },
      { label: 'Product D', online: 1800, retail: 3500 },
    ],
    keys: ['online', 'retail'],
    labels: { online: 'Online', retail: 'Retail' },
  }}
/>
