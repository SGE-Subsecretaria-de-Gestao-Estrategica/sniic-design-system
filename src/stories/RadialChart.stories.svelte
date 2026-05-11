<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import RadialChart from '../lib/components/RadialChart.svelte';
  import { blue, orange, teal, yellow, purple, lime } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/RadialChart',
    component: RadialChart,
    tags: ['autodocs'],
    argTypes: {
      showDots:        { control: 'boolean' },
      showLevelLabels: { control: 'boolean' },
      showLegend:      { control: 'boolean' },
      strokeWidth:     { control: { type: 'range', min: 1, max: 6, step: 0.5 } },
      dotRadius:       { control: { type: 'range', min: 2, max: 10, step: 1 } },
      fillOpacity:     { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
      levels:          { control: { type: 'range', min: 2, max: 8, step: 1 } },
      size:            { control: { type: 'range', min: 200, max: 600, step: 50 } },
    },
  });
</script>

<Story
  name="Default"
  args={{
    size: 420,
    levels: 5,
    showDots: true,
    showLevelLabels: true,
    showLegend: false,
    strokeWidth: 2,
    dotRadius: 4,
    fillOpacity: 0.15,
    series: [
      {
        name: 'Brasil',
        values: [
          { axis: 'Saúde',       value: 72 },
          { axis: 'Educação',    value: 58 },
          { axis: 'Renda',       value: 45 },
          { axis: 'Habitação',   value: 63 },
          { axis: 'Saneamento',  value: 54 },
          { axis: 'Mobilidade',  value: 38 },
        ],
      },
    ],
  }}
/>

<Story
  name="Multi-series"
  args={{
    size: 420,
    levels: 5,
    showDots: true,
    showLevelLabels: true,
    showLegend: true,
    strokeWidth: 2,
    dotRadius: 4,
    fillOpacity: 0.15,
    series: [
      {
        name: 'Norte',
        color: blue,
        values: [
          { axis: 'Saúde',       value: 58 },
          { axis: 'Educação',    value: 42 },
          { axis: 'Renda',       value: 31 },
          { axis: 'Habitação',   value: 47 },
          { axis: 'Saneamento',  value: 35 },
          { axis: 'Mobilidade',  value: 28 },
        ],
      },
      {
        name: 'Sudeste',
        color: orange,
        values: [
          { axis: 'Saúde',       value: 81 },
          { axis: 'Educação',    value: 74 },
          { axis: 'Renda',       value: 67 },
          { axis: 'Habitação',   value: 72 },
          { axis: 'Saneamento',  value: 78 },
          { axis: 'Mobilidade',  value: 61 },
        ],
      },
      {
        name: 'Nordeste',
        color: teal,
        values: [
          { axis: 'Saúde',       value: 62 },
          { axis: 'Educação',    value: 51 },
          { axis: 'Renda',       value: 38 },
          { axis: 'Habitação',   value: 55 },
          { axis: 'Saneamento',  value: 44 },
          { axis: 'Mobilidade',  value: 33 },
        ],
      },
    ],
  }}
/>

<Story
  name="Formatted Values"
  args={{
    size: 420,
    levels: 4,
    showDots: true,
    showLevelLabels: true,
    showLegend: false,
    strokeWidth: 2.5,
    dotRadius: 5,
    fillOpacity: 0.2,
    format: (v) => `${v}%`,
    series: [
      {
        name: 'Indicadores 2024',
        color: purple,
        values: [
          { axis: 'Cobertura Vacinal', value: 88 },
          { axis: 'Acesso à Água',     value: 76 },
          { axis: 'Alfabetização',     value: 93 },
          { axis: 'Emprego Formal',    value: 52 },
          { axis: 'Coleta de Lixo',    value: 84 },
        ],
      },
    ],
  }}
/>

<Story
  name="Comparison"
  args={{
    size: 440,
    levels: 5,
    showDots: true,
    showLevelLabels: true,
    showLegend: true,
    strokeWidth: 2,
    dotRadius: 4,
    fillOpacity: 0.12,
    series: [
      {
        name: '2019',
        color: yellow,
        values: [
          { axis: 'Saúde',      value: 60 },
          { axis: 'Educação',   value: 55 },
          { axis: 'Renda',      value: 48 },
          { axis: 'Habitação',  value: 50 },
          { axis: 'Ambiente',   value: 43 },
        ],
      },
      {
        name: '2024',
        color: lime,
        values: [
          { axis: 'Saúde',      value: 74 },
          { axis: 'Educação',   value: 68 },
          { axis: 'Renda',      value: 55 },
          { axis: 'Habitação',  value: 62 },
          { axis: 'Ambiente',   value: 58 },
        ],
      },
    ],
  }}
/>
