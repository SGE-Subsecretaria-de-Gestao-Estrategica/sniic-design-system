<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BubbleScatter from '../lib/components/BubbleScatter.svelte';

  const allStates = {
    'São Paulo':          { uf: 'São Paulo',          popTotal: 46000000, valorRecebido: 820000000, qtdFomentos: 420, valorPerCapita: 17.8 },
    'Rio de Janeiro':     { uf: 'Rio de Janeiro',     popTotal: 17000000, valorRecebido: 310000000, qtdFomentos: 180, valorPerCapita: 18.2 },
    'Minas Gerais':       { uf: 'Minas Gerais',       popTotal: 21000000, valorRecebido: 280000000, qtdFomentos: 160, valorPerCapita: 13.3 },
    'Bahia':              { uf: 'Bahia',              popTotal: 14800000, valorRecebido: 210000000, qtdFomentos: 130, valorPerCapita: 14.2 },
    'Paraná':             { uf: 'Paraná',             popTotal: 11400000, valorRecebido: 190000000, qtdFomentos: 95,  valorPerCapita: 16.7 },
    'Rio Grande do Sul':  { uf: 'Rio Grande do Sul',  popTotal: 11400000, valorRecebido: 175000000, qtdFomentos: 88,  valorPerCapita: 15.4 },
    'Pernambuco':         { uf: 'Pernambuco',         popTotal: 9600000,  valorRecebido: 145000000, qtdFomentos: 72,  valorPerCapita: 15.1 },
    'Ceará':              { uf: 'Ceará',              popTotal: 9200000,  valorRecebido: 120000000, qtdFomentos: 68,  valorPerCapita: 13.0 },
    'Pará':               { uf: 'Pará',               popTotal: 8700000,  valorRecebido: 98000000,  qtdFomentos: 52,  valorPerCapita: 11.3 },
    'Maranhão':           { uf: 'Maranhão',           popTotal: 7100000,  valorRecebido: 72000000,  qtdFomentos: 38,  valorPerCapita: 10.1 },
    'Goiás':              { uf: 'Goiás',              popTotal: 7100000,  valorRecebido: 88000000,  qtdFomentos: 45,  valorPerCapita: 12.4 },
    'Amazonas':           { uf: 'Amazonas',           popTotal: 4200000,  valorRecebido: 58000000,  qtdFomentos: 30,  valorPerCapita: 13.8 },
    'Espírito Santo':     { uf: 'Espírito Santo',     popTotal: 4100000,  valorRecebido: 65000000,  qtdFomentos: 35,  valorPerCapita: 15.9 },
    'Mato Grosso':        { uf: 'Mato Grosso',        popTotal: 3600000,  valorRecebido: 52000000,  qtdFomentos: 28,  valorPerCapita: 14.4 },
    'Distrito Federal':   { uf: 'Distrito Federal',   popTotal: 3000000,  valorRecebido: 78000000,  qtdFomentos: 42,  valorPerCapita: 26.0 },
    'Paraíba':            { uf: 'Paraíba',            popTotal: 4000000,  valorRecebido: 55000000,  qtdFomentos: 28,  valorPerCapita: 13.8 },
    'Piauí':              { uf: 'Piauí',              popTotal: 3300000,  valorRecebido: 40000000,  qtdFomentos: 20,  valorPerCapita: 12.1 },
    'Rio Grande do Norte':{ uf: 'Rio Grande do Norte',popTotal: 3500000,  valorRecebido: 48000000,  qtdFomentos: 25,  valorPerCapita: 13.7 },
    'Alagoas':            { uf: 'Alagoas',            popTotal: 3300000,  valorRecebido: 38000000,  qtdFomentos: 18,  valorPerCapita: 11.5 },
    'Sergipe':            { uf: 'Sergipe',            popTotal: 2300000,  valorRecebido: 30000000,  qtdFomentos: 15,  valorPerCapita: 13.0 },
  };

  const { Story } = defineMeta({
    title: 'Charts/BubbleScatter',
    component: BubbleScatter,
    tags: ['autodocs'],
  });
</script>

<Story name="All States" args={{ states: allStates }} />

<Story
  name="Southeast & South"
  args={{
    states: {
      'São Paulo':         allStates['São Paulo'],
      'Rio de Janeiro':    allStates['Rio de Janeiro'],
      'Minas Gerais':      allStates['Minas Gerais'],
      'Espírito Santo':    allStates['Espírito Santo'],
      'Paraná':            allStates['Paraná'],
      'Rio Grande do Sul': allStates['Rio Grande do Sul'],
      'Santa Catarina':    { uf: 'Santa Catarina', popTotal: 7300000, valorRecebido: 148000000, qtdFomentos: 78, valorPerCapita: 20.3 },
    },
  }}
/>

<Story
  name="Northeast"
  args={{
    states: {
      'Bahia':               allStates['Bahia'],
      'Pernambuco':          allStates['Pernambuco'],
      'Ceará':               allStates['Ceará'],
      'Maranhão':            allStates['Maranhão'],
      'Paraíba':             allStates['Paraíba'],
      'Piauí':               allStates['Piauí'],
      'Rio Grande do Norte': allStates['Rio Grande do Norte'],
      'Alagoas':             allStates['Alagoas'],
      'Sergipe':             allStates['Sergipe'],
    },
  }}
/>
