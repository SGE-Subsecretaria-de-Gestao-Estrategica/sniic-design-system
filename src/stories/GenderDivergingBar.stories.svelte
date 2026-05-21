<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DivergingBarChart from '../lib/components/DivergingBarChart.svelte';

  const fullData = [
    { label: 'SP', leftPct: 51.8 },
    { label: 'RJ', leftPct: 53.2 },
    { label: 'MG', leftPct: 50.9 },
    { label: 'BA', leftPct: 52.1 },
    { label: 'RS', leftPct: 50.4 },
    { label: 'PR', leftPct: 50.6 },
    { label: 'PE', leftPct: 52.8 },
    { label: 'CE', leftPct: 52.4 },
    { label: 'PA', leftPct: 49.7 },
    { label: 'MA', leftPct: 51.6 },
    { label: 'GO', leftPct: 50.2 },
    { label: 'AM', leftPct: 49.3 },
  ];

  const { Story } = defineMeta({
    title: 'Charts/DivergingBarChart',
    component: DivergingBarChart,
    tags: ['autodocs'],
    argTypes: {
      referenceValue: { control: { type: 'range', min: 0, max: 100, step: 0.1 } },
    },
  });
</script>

<Story
  name="With Reference Line"
  args={{
    data: fullData,
    leftLabel: 'Feminino',
    rightLabel: 'Masculino',
    referenceValue: 51.5,
    referenceLabel: 'média',
  }}
/>

<Story
  name="Without Reference Line"
  args={{
    data: fullData,
    leftLabel: 'Feminino',
    rightLabel: 'Masculino',
  }}
/>

<Story
  name="Generic Data"
  args={{
    data: [
      { label: 'Region A', leftPct: 62 },
      { label: 'Region B', leftPct: 45 },
      { label: 'Region C', leftPct: 55 },
      { label: 'Region D', leftPct: 38 },
      { label: 'Region E', leftPct: 71 },
    ],
    leftLabel: 'Online',
    rightLabel: 'In-Store',
    referenceValue: 50,
    referenceLabel: 'avg',
  }}
/>

<Story
  name="With State Flags"
  args={{
    data: fullData,
    leftLabel: 'Feminino',
    rightLabel: 'Masculino',
    referenceValue: 51.5,
    referenceLabel: 'média',
    showFlags: true,
  }}
/>
