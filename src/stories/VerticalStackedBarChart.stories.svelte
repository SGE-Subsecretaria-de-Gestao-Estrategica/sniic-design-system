<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import VerticalStackedBarChart from '../lib/components/VerticalStackedBarChart.svelte';

  const BRL = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  const allStates = [
    { label: 'AC', audiovisual:  8000000, demais: 12000000 },
    { label: 'AL', audiovisual: 14000000, demais: 22000000 },
    { label: 'AP', audiovisual:  6000000, demais: 10000000 },
    { label: 'AM', audiovisual: 16000000, demais: 42000000 },
    { label: 'BA', audiovisual: 75000000, demais: 135000000 },
    { label: 'CE', audiovisual: 48000000, demais: 72000000 },
    { label: 'DF', audiovisual: 28000000, demais: 50000000 },
    { label: 'ES', audiovisual: 22000000, demais: 43000000 },
    { label: 'GO', audiovisual: 35000000, demais: 53000000 },
    { label: 'MA', audiovisual: 12000000, demais: 28000000 },
    { label: 'MT', audiovisual: 18000000, demais: 34000000 },
    { label: 'MS', audiovisual: 15000000, demais: 30000000 },
    { label: 'MG', audiovisual: 90000000, demais: 190000000 },
    { label: 'PA', audiovisual: 30000000, demais: 68000000 },
    { label: 'PB', audiovisual: 18000000, demais: 32000000 },
    { label: 'PR', audiovisual: 65000000, demais: 125000000 },
    { label: 'PE', audiovisual: 55000000, demais: 90000000 },
    { label: 'PI', audiovisual: 10000000, demais: 18000000 },
    { label: 'RJ', audiovisual: 180000000, demais: 130000000 },
    { label: 'RN', audiovisual: 16000000, demais: 26000000 },
    { label: 'RS', audiovisual: 60000000, demais: 115000000 },
    { label: 'RO', audiovisual: 10000000, demais: 16000000 },
    { label: 'RR', audiovisual:  5000000, demais:  8000000 },
    { label: 'SC', audiovisual: 42000000, demais: 106000000 },
    { label: 'SP', audiovisual: 320000000, demais: 500000000 },
    { label: 'SE', audiovisual: 11000000, demais: 20000000 },
    { label: 'TO', audiovisual:  7000000, demais: 14000000 },
  ];

  const allStateFlags = {
    AC: '/flags/states/AC.svg', AL: '/flags/states/AL.svg', AP: '/flags/states/AP.svg',
    AM: '/flags/states/AM.svg', BA: '/flags/states/BA.svg', CE: '/flags/states/CE.svg',
    DF: '/flags/states/DF.svg', ES: '/flags/states/ES.svg', GO: '/flags/states/GO.svg',
    MA: '/flags/states/MA.svg', MT: '/flags/states/MT.svg', MS: '/flags/states/MS.svg',
    MG: '/flags/states/MG.svg', PA: '/flags/states/PA.svg', PB: '/flags/states/PB.svg',
    PR: '/flags/states/PR.svg', PE: '/flags/states/PE.svg', PI: '/flags/states/PI.svg',
    RJ: '/flags/states/RJ.svg', RN: '/flags/states/RN.svg', RS: '/flags/states/RS.svg',
    RO: '/flags/states/RO.svg', RR: '/flags/states/RR.svg', SC: '/flags/states/SC.svg',
    SP: '/flags/states/SP.svg', SE: '/flags/states/SE.svg', TO: '/flags/states/TO.svg',
  };

  const { Story } = defineMeta({
    title: 'Charts/VerticalStackedBarChart',
    component: VerticalStackedBarChart,
    tags: ['autodocs'],
  });
</script>

<Story
  name="All States"
  args={{
    data: allStates,
    keys: ['audiovisual', 'demais'],
    labels: { audiovisual: 'Audiovisual', demais: 'Demais Áreas' },
    yTickFormat: (v) => BRL.format(v),
    height: 360,
  }}
/>

<Story
  name="All States (Normalized)"
  args={{
    data: allStates,
    keys: ['audiovisual', 'demais'],
    labels: { audiovisual: 'Audiovisual', demais: 'Demais Áreas' },
    normalize: true,
    height: 360,
  }}
/>

<Story
  name="Top 5"
  args={{
    data: allStates.slice(0, 5),
    keys: ['audiovisual', 'demais'],
    labels: { audiovisual: 'Audiovisual', demais: 'Demais Áreas' },
    yTickFormat: (v) => BRL.format(v),
  }}
/>

<Story
  name="All States (With Flags)"
  args={{
    data: allStates,
    keys: ['audiovisual', 'demais'],
    labels: { audiovisual: 'Audiovisual', demais: 'Demais Áreas' },
    yTickFormat: (v) => BRL.format(v),
    icons: allStateFlags,
    height: 360,
  }}
/>
