<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import GenderDivergingBar from '../lib/components/GenderDivergingBar.svelte';

  const fullData = [
    { uf: 'SP', pctFeminino: 51.8, qtdFeminino: 23800, qtdMasculino: 22200 },
    { uf: 'RJ', pctFeminino: 53.2, qtdFeminino: 9000,  qtdMasculino: 7900  },
    { uf: 'MG', pctFeminino: 50.9, qtdFeminino: 10700, qtdMasculino: 10300 },
    { uf: 'BA', pctFeminino: 52.1, qtdFeminino: 7700,  qtdMasculino: 7100  },
    { uf: 'RS', pctFeminino: 50.4, qtdFeminino: 5740,  qtdMasculino: 5660  },
    { uf: 'PR', pctFeminino: 50.6, qtdFeminino: 5750,  qtdMasculino: 5620  },
    { uf: 'PE', pctFeminino: 52.8, qtdFeminino: 5060,  qtdMasculino: 4520  },
    { uf: 'CE', pctFeminino: 52.4, qtdFeminino: 4800,  qtdMasculino: 4360  },
    { uf: 'PA', pctFeminino: 49.7, qtdFeminino: 4320,  qtdMasculino: 4380  },
    { uf: 'MA', pctFeminino: 51.6, qtdFeminino: 3660,  qtdMasculino: 3430  },
    { uf: 'GO', pctFeminino: 50.2, qtdFeminino: 3560,  qtdMasculino: 3520  },
    { uf: 'AM', pctFeminino: 49.3, qtdFeminino: 2060,  qtdMasculino: 2130  },
  ];

  const { Story } = defineMeta({
    title: 'Charts/GenderDivergingBar',
    component: GenderDivergingBar,
    tags: ['autodocs'],
    argTypes: {
      nationalAvg: { control: { type: 'range', min: 0, max: 100, step: 0.1 } },
    },
  });
</script>

<Story
  name="With National Average"
  args={{ data: fullData, nationalAvg: 51.5 }}
/>

<Story
  name="Without Reference Line"
  args={{ data: fullData, nationalAvg: 0 }}
/>

<Story
  name="Few States"
  args={{ data: fullData.slice(0, 5), nationalAvg: 51.5 }}
/>
