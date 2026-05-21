<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BoxPlotChart from '../lib/components/BoxPlotChart.svelte';
  import { colors } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/BoxPlotChart',
    component: BoxPlotChart,
    tags: ['autodocs'],
    argTypes: {
      color: { control: 'color' },
      height: { control: { type: 'range', min: 200, max: 600, step: 50 } },
    },
  });
</script>

<Story
  name="Default"
  args={{
    data: [
      { label: 'Norte',        values: [12, 18, 22, 25, 28, 30, 35, 40, 42, 45, 48, 52, 55, 60, 65] },
      { label: 'Nordeste',     values: [20, 28, 33, 38, 42, 45, 48, 50, 53, 58, 62, 65, 70, 72, 75] },
      { label: 'Centro-Oeste', values: [35, 42, 48, 52, 55, 58, 60, 63, 67, 70, 74, 78, 82, 85, 90] },
      { label: 'Sudeste',      values: [50, 58, 65, 70, 72, 75, 78, 80, 83, 86, 88, 90, 93, 95, 98] },
      { label: 'Sul',          values: [45, 52, 58, 62, 65, 68, 70, 73, 76, 80, 83, 85, 88, 90, 92] },
    ],
    height: 400,
    color: colors.primary[0],
    xLabel: 'Região',
    yLabel: 'Score (%)',
  }}
/>

<Story
  name="With Outliers"
  args={{
    data: [
      { label: 'Música',    values: [40, 45, 50, 55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 5, 95] },
      { label: 'Cinema',    values: [30, 38, 42, 48, 52, 55, 58, 60, 63, 65, 68, 70, 3, 97, 99] },
      { label: 'Teatro',    values: [20, 28, 32, 36, 40, 43, 46, 50, 52, 55, 58, 60, 2, 85] },
      { label: 'Dança',     values: [15, 22, 28, 32, 36, 38, 42, 45, 48, 52, 55, 1, 80] },
      { label: 'Artes',     values: [25, 30, 35, 40, 43, 46, 50, 53, 56, 60, 63, 65, 4, 90] },
    ],
    height: 400,
    color: colors.accent[0],
    showOutliers: true,
    xLabel: 'Segmento',
    yLabel: 'Projetos aprovados',
  }}
/>

<Story
  name="Pre-computed Stats"
  args={{
    data: [
      { label: '2020', stats: { min: 20, q1: 35, median: 52, q3: 68, max: 85 } },
      { label: '2021', stats: { min: 18, q1: 30, median: 45, q3: 60, max: 78, outliers: [5, 95] } },
      { label: '2022', stats: { min: 28, q1: 42, median: 58, q3: 73, max: 90 } },
      { label: '2023', stats: { min: 32, q1: 48, median: 65, q3: 80, max: 95 } },
      { label: '2024', stats: { min: 38, q1: 55, median: 70, q3: 84, max: 98 } },
    ],
    height: 400,
    color: colors.primary[1],
    xLabel: 'Ano',
    yLabel: 'Execução financeira (%)',
  }}
/>

<Story
  name="No Outliers"
  args={{
    data: [
      { label: 'AC', values: [10, 15, 20, 25, 30, 35, 40, 45, 50, 2, 80] },
      { label: 'BA', values: [25, 32, 40, 48, 55, 62, 68, 74, 80, 3, 95] },
      { label: 'MG', values: [40, 50, 58, 65, 70, 75, 80, 85, 88, 1, 98] },
      { label: 'SP', values: [55, 62, 68, 74, 78, 82, 85, 88, 91, 4, 99] },
    ],
    height: 360,
    color: colors.primary[0],
    showOutliers: false,
    xLabel: 'Estado',
    yLabel: 'Índice cultural',
  }}
/>
