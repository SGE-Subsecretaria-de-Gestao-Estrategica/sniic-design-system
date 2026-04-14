<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import StackedBarChart from '../lib/components/StackedBarChart.svelte';

  const fullData = [
    { uf: 'São Paulo',          audiovisual: 320000000, demais: 500000000 },
    { uf: 'Rio de Janeiro',     audiovisual: 180000000, demais: 130000000 },
    { uf: 'Minas Gerais',       audiovisual: 90000000,  demais: 190000000 },
    { uf: 'Bahia',              audiovisual: 75000000,  demais: 135000000 },
    { uf: 'Paraná',             audiovisual: 65000000,  demais: 125000000 },
    { uf: 'Rio Grande do Sul',  audiovisual: 60000000,  demais: 115000000 },
    { uf: 'Pernambuco',         audiovisual: 55000000,  demais: 90000000  },
    { uf: 'Ceará',              audiovisual: 48000000,  demais: 72000000  },
    { uf: 'Santa Catarina',     audiovisual: 42000000,  demais: 106000000 },
    { uf: 'Goiás',              audiovisual: 35000000,  demais: 53000000  },
    { uf: 'Pará',               audiovisual: 30000000,  demais: 68000000  },
    { uf: 'Distrito Federal',   audiovisual: 28000000,  demais: 50000000  },
    { uf: 'Espírito Santo',     audiovisual: 22000000,  demais: 43000000  },
    { uf: 'Mato Grosso',        audiovisual: 18000000,  demais: 34000000  },
    { uf: 'Amazonas',           audiovisual: 16000000,  demais: 42000000  },
  ];

  const { Story } = defineMeta({
    title: 'Charts/StackedBarChart',
    component: StackedBarChart,
    tags: ['autodocs'],
  });
</script>

<Story name="All States" args={{ data: fullData }} />

<Story name="Top 5" args={{ data: fullData.slice(0, 5) }} />

<Story
  name="Audiovisual Dominant"
  args={{
    data: [
      { uf: 'Rio de Janeiro', audiovisual: 180000000, demais: 130000000 },
      { uf: 'São Paulo',      audiovisual: 320000000, demais: 200000000 },
      { uf: 'Bahia',          audiovisual: 120000000, demais: 90000000  },
      { uf: 'Pernambuco',     audiovisual: 90000000,  demais: 55000000  },
      { uf: 'Ceará',          audiovisual: 75000000,  demais: 45000000  },
    ],
  }}
/>
