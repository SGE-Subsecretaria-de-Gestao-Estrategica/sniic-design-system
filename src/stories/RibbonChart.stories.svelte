<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import RibbonChart from '../lib/components/RibbonChart.svelte';
  import { BRL, NUM } from '../lib/utils/formatters';

  const { Story } = defineMeta({
    title: 'Charts/RibbonChart',
    component: RibbonChart,
    tags: ['autodocs'],
    argTypes: {
      columnRatio: { control: { type: 'range', min: 0.15, max: 0.8, step: 0.01 } },
      segmentGap: { control: { type: 'range', min: 0, max: 16, step: 1 } },
      ribbonOpacity: { control: { type: 'range', min: 0.1, max: 1, step: 0.05 } },
      cornerRadius: { control: { type: 'range', min: 0, max: 12, step: 1 } },
      rankDirection: { control: { type: 'inline-radio' }, options: ['desc', 'asc'] },
      showValues: { control: { type: 'boolean' } },
      data: { control: false },
      keys: { control: false },
      theme: { control: false },
      valueFormat: { control: false },
    },
  });

  /** Ranks swap every year — the case the ribbon chart exists for. */
  const linguagens = [
    { label: '2019', Audiovisual: 320, Música: 280, Teatro: 210, Dança: 120, Literatura: 90 },
    { label: '2020', Audiovisual: 180, Música: 340, Teatro: 150, Dança: 100, Literatura: 160 },
    { label: '2021', Audiovisual: 260, Música: 220, Teatro: 320, Dança: 140, Literatura: 130 },
    { label: '2022', Audiovisual: 410, Música: 200, Teatro: 240, Dança: 220, Literatura: 110 },
    { label: '2023', Audiovisual: 300, Música: 380, Teatro: 260, Dança: 190, Literatura: 240 },
    { label: '2024', Audiovisual: 350, Música: 290, Teatro: 400, Dança: 260, Literatura: 180 },
  ];

  /** A dominant series with small ones beside it — the callout path. */
  const fontes = [
    { label: '2019', Próprio: 7_500_000_000, Emendas: 0, LAB: 0, LPG: 0, PNAB: 0 },
    { label: '2020', Próprio: 7_100_000_000, Emendas: 3_000_000, LAB: 1_200_000_000, LPG: 0, PNAB: 0 },
    { label: '2021', Próprio: 5_400_000_000, Emendas: 4_000_000, LAB: 525_300_000, LPG: 0, PNAB: 0 },
    { label: '2022', Próprio: 9_200_000_000, Emendas: 12_000_000, LAB: 60_000_000, LPG: 0, PNAB: 0 },
    { label: '2023', Próprio: 12_600_000_000, Emendas: 60_000_000, LAB: 0, LPG: 605_300_000, PNAB: 0 },
    { label: '2024', Próprio: 14_900_000_000, Emendas: 184_100_000, LAB: 0, LPG: 782_600_000, PNAB: 583_600_000 },
    { label: '2025', Próprio: 15_900_000_000, Emendas: 164_300_000, LAB: 0, LPG: 205_400_000, PNAB: 644_600_000 },
  ];
</script>

<!--
  Ribbon chart — a stacked column chart that re-ranks its series in every column
  and links each series across columns with a ribbon, so a series changing
  position shows up as the ribbon crossing. Values are written inside the
  columns; bands too small to hold one get a callout on a leader line.
-->

<Story
  name="Trocas de posição"
  args={{ data: linguagens, valueFormat: (v) => NUM.format(v), height: 460 }}
/>

<Story
  name="Menor no topo"
  args={{
    data: linguagens,
    valueFormat: (v) => NUM.format(v),
    rankDirection: 'asc',
    height: 460,
  }}
/>

<Story
  name="Colunas largas"
  args={{
    data: linguagens,
    valueFormat: (v) => NUM.format(v),
    columnRatio: 0.65,
    ribbonOpacity: 0.35,
    height: 460,
  }}
/>

<Story
  name="Série dominante (callouts)"
  args={{
    data: fontes,
    labels: { Próprio: 'Recurso próprio', LAB: 'LAB 1' },
    valueFormat: (v) => BRL.format(v),
    height: 460,
  }}
/>

<Story
  name="Sem valores"
  args={{
    data: linguagens,
    valueFormat: (v) => NUM.format(v),
    showValues: false,
    height: 460,
  }}
/>
