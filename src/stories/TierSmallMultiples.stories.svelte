<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TierSmallMultiples from '../lib/components/TierSmallMultiples.svelte';

  // Requires /geo/brazil-states.geojson to be served as a static asset
  const makeTierData = (execBase, valBase) => ({
    'São Paulo':          { execucaoFinanceira: Math.min(100, execBase + 4.2), valorRecebido: valBase * 2.2 },
    'Rio de Janeiro':     { execucaoFinanceira: Math.min(100, execBase + 2.8), valorRecebido: valBase * 1.8 },
    'Minas Gerais':       { execucaoFinanceira: Math.min(100, execBase + 1.5), valorRecebido: valBase * 1.5 },
    'Bahia':              { execucaoFinanceira: execBase - 0.8,                valorRecebido: valBase * 1.1 },
    'Paraná':             { execucaoFinanceira: Math.min(100, execBase + 2.1), valorRecebido: valBase * 1.3 },
    'Rio Grande do Sul':  { execucaoFinanceira: Math.min(100, execBase + 1.0), valorRecebido: valBase * 1.2 },
    'Pernambuco':         { execucaoFinanceira: execBase - 1.6,                valorRecebido: valBase * 0.9 },
    'Ceará':              { execucaoFinanceira: execBase - 2.4,                valorRecebido: valBase * 0.8 },
    'Santa Catarina':     { execucaoFinanceira: Math.min(100, execBase + 3.3), valorRecebido: valBase * 1.4 },
    'Goiás':              { execucaoFinanceira: execBase - 0.3,                valorRecebido: valBase * 0.75 },
    'Pará':               { execucaoFinanceira: execBase - 3.1,                valorRecebido: valBase * 0.65 },
    'Maranhão':           { execucaoFinanceira: execBase - 5.0,                valorRecebido: valBase * 0.5 },
  });

  const tiersData = {
    'Capitais':         makeTierData(98.0, 80000000),
    'Grande Porte':     makeTierData(95.0, 40000000),
    'Médio Porte':      makeTierData(92.0, 18000000),
    'Pequeno Porte II': makeTierData(88.0, 8000000),
    'Pequeno Porte I':  makeTierData(84.0, 3000000),
  };

  const BRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1,
  });

  const { Story } = defineMeta({
    title: 'Charts/TierSmallMultiples',
    component: TierSmallMultiples,
    tags: ['autodocs'],
    argTypes: {
      metric: {
        control: 'select',
        options: ['execucaoFinanceira', 'valorRecebido'],
      },
    },
  });
</script>

<Story
  name="Execução Financeira"
  args={{
    tiers: tiersData,
    metric: 'execucaoFinanceira',
    format: (v) => `${v.toFixed(1)}%`,
  }}
/>

<Story
  name="Valor Recebido"
  args={{
    tiers: tiersData,
    metric: 'valorRecebido',
    format: (v) => BRL.format(v),
  }}
/>
