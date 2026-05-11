<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChoroplethMap from '../lib/components/ChoroplethMap.svelte';
  import { colorScales } from '../lib/tokens.js';

  // Requires /geo/brazil-states.geojson to be served as a static asset
  const statesData = {
    'Acre':                { execucaoFinanceira: 88.2, valorRecebido: 12000000,  valorPerCapita: 13.5, qtdFomentos: 8   },
    'Alagoas':             { execucaoFinanceira: 91.5, valorRecebido: 38000000,  valorPerCapita: 11.5, qtdFomentos: 18  },
    'Amapá':               { execucaoFinanceira: 79.3, valorRecebido: 9500000,   valorPerCapita: 10.9, qtdFomentos: 6   },
    'Amazonas':            { execucaoFinanceira: 94.1, valorRecebido: 58000000,  valorPerCapita: 13.8, qtdFomentos: 30  },
    'Bahia':               { execucaoFinanceira: 96.8, valorRecebido: 210000000, valorPerCapita: 14.2, qtdFomentos: 130 },
    'Ceará':               { execucaoFinanceira: 95.2, valorRecebido: 120000000, valorPerCapita: 13.0, qtdFomentos: 68  },
    'Distrito Federal':    { execucaoFinanceira: 99.1, valorRecebido: 78000000,  valorPerCapita: 26.0, qtdFomentos: 42  },
    'Espírito Santo':      { execucaoFinanceira: 97.3, valorRecebido: 65000000,  valorPerCapita: 15.9, qtdFomentos: 35  },
    'Goiás':               { execucaoFinanceira: 93.7, valorRecebido: 88000000,  valorPerCapita: 12.4, qtdFomentos: 45  },
    'Maranhão':            { execucaoFinanceira: 88.9, valorRecebido: 72000000,  valorPerCapita: 10.1, qtdFomentos: 38  },
    'Mato Grosso':         { execucaoFinanceira: 92.4, valorRecebido: 52000000,  valorPerCapita: 14.4, qtdFomentos: 28  },
    'Mato Grosso do Sul':  { execucaoFinanceira: 94.8, valorRecebido: 48000000,  valorPerCapita: 17.1, qtdFomentos: 25  },
    'Minas Gerais':        { execucaoFinanceira: 96.2, valorRecebido: 280000000, valorPerCapita: 13.3, qtdFomentos: 160 },
    'Pará':                { execucaoFinanceira: 90.5, valorRecebido: 98000000,  valorPerCapita: 11.3, qtdFomentos: 52  },
    'Paraíba':             { execucaoFinanceira: 93.1, valorRecebido: 55000000,  valorPerCapita: 13.8, qtdFomentos: 28  },
    'Paraná':              { execucaoFinanceira: 97.8, valorRecebido: 190000000, valorPerCapita: 16.7, qtdFomentos: 95  },
    'Pernambuco':          { execucaoFinanceira: 95.6, valorRecebido: 145000000, valorPerCapita: 15.1, qtdFomentos: 72  },
    'Piauí':               { execucaoFinanceira: 87.4, valorRecebido: 40000000,  valorPerCapita: 12.1, qtdFomentos: 20  },
    'Rio de Janeiro':      { execucaoFinanceira: 98.2, valorRecebido: 310000000, valorPerCapita: 18.2, qtdFomentos: 180 },
    'Rio Grande do Norte': { execucaoFinanceira: 91.8, valorRecebido: 48000000,  valorPerCapita: 13.7, qtdFomentos: 25  },
    'Rio Grande do Sul':   { execucaoFinanceira: 97.1, valorRecebido: 175000000, valorPerCapita: 15.4, qtdFomentos: 88  },
    'Rondônia':            { execucaoFinanceira: 89.6, valorRecebido: 32000000,  valorPerCapita: 18.2, qtdFomentos: 15  },
    'Roraima':             { execucaoFinanceira: 82.3, valorRecebido: 8000000,   valorPerCapita: 12.4, qtdFomentos: 5   },
    'Santa Catarina':      { execucaoFinanceira: 98.4, valorRecebido: 148000000, valorPerCapita: 20.4, qtdFomentos: 78  },
    'São Paulo':           { execucaoFinanceira: 99.3, valorRecebido: 820000000, valorPerCapita: 17.8, qtdFomentos: 420 },
    'Sergipe':             { execucaoFinanceira: 92.7, valorRecebido: 30000000,  valorPerCapita: 13.0, qtdFomentos: 15  },
    'Tocantins':           { execucaoFinanceira: 86.1, valorRecebido: 22000000,  valorPerCapita: 13.8, qtdFomentos: 12  },
  };

  const BRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1,
  });

  const { Story } = defineMeta({
    title: 'Charts/ChoroplethMap',
    component: ChoroplethMap,
    tags: ['autodocs'],
    argTypes: {
      showCapitals: { control: 'boolean' },
      metric: {
        control: 'select',
        options: ['execucaoFinanceira', 'valorRecebido', 'valorPerCapita', 'qtdFomentos'],
      },
    },
  });
</script>

<Story
  name="Valor Recebido"
  args={{
    states: statesData,
    metric: 'valorRecebido',
    label: 'Valor Recebido',
    format: (v) => BRL.format(v),
    colorRange: [...colorScales.blue],
    showCapitals: false,
  }}
/>

<Story
  name="Execução Financeira"
  args={{
    states: statesData,
    metric: 'execucaoFinanceira',
    label: 'Execução Financeira',
    format: (v) => `${v.toFixed(1)}%`,
    colorRange: [...colorScales.lime],
    showCapitals: false,
  }}
/>

<Story
  name="Valor Per Capita"
  args={{
    states: statesData,
    metric: 'valorPerCapita',
    label: 'Valor Per Capita',
    format: (v) => BRL.format(v),
    colorRange: [...colorScales.yellow],
    showCapitals: false,
  }}
/>
