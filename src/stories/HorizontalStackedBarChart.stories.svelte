<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import HorizontalStackedBarChart from '../lib/components/HorizontalStackedBarChart.svelte';

  const data = [
    { label: 'São Paulo',      audiovisual: 320, demais: 500 },
    { label: 'Rio de Janeiro', audiovisual: 180, demais: 130 },
    { label: 'Minas Gerais',   audiovisual: 90,  demais: 190 },
    { label: 'Bahia',          audiovisual: 75,  demais: 135 },
    { label: 'Paraná',         audiovisual: 65,  demais: 125 },
  ];

  const flagData = [
    { label: 'SP', audiovisual: 320, demais: 500 },
    { label: 'RJ', audiovisual: 180, demais: 130 },
    { label: 'MG', audiovisual: 90,  demais: 190 },
    { label: 'BA', audiovisual: 75,  demais: 135 },
    { label: 'PR', audiovisual: 65,  demais: 125 },
  ];

  const stateFlags = {
    SP: '/flags/states/SP.svg',
    RJ: '/flags/states/RJ.svg',
    MG: '/flags/states/MG.svg',
    BA: '/flags/states/BA.svg',
    PR: '/flags/states/PR.svg',
  };

  const keys = ['audiovisual', 'demais'];
  const labels = { audiovisual: 'Audiovisual', demais: 'Demais Áreas' };

  const { Story } = defineMeta({
    title: 'Charts/HorizontalStackedBarChart',
    component: HorizontalStackedBarChart,
    tags: ['autodocs'],
  });
</script>

<Story
  name="Default"
  args={{
    data,
    keys,
    labels,
  }}
/>

<Story
  name="With Flags"
  args={{
    data: flagData,
    keys,
    labels,
    icons: stateFlags,
  }}
/>

<Story
  name="With State Flags (showFlags)"
  args={{
    data: flagData,
    keys,
    labels,
    showFlags: true,
  }}
/>
