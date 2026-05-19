<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AnnotationBoxBigNumberDemo from './_AnnotationBoxBigNumberDemo.svelte';
  import { orange, blue, red, teal } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Molecules/AnnotationBox BigNumber',
    component: AnnotationBoxBigNumberDemo,
    tags: ['autodocs'],
    argTypes: {
      boxWidth:           { control: { type: 'range', min: 150, max: 400, step: 10 } },
      boxHeight:          { control: { type: 'range', min: 100, max: 300, step: 10 } },
      circleRadius:       { control: { type: 'range', min: 8, max: 30, step: 1 } },
      bigNumberFontSize:  { control: { type: 'range', min: 24, max: 96, step: 4 } },
      color:              { control: 'color' },
    },
  });
</script>

<Story
  name="Default"
  args={{
    pointX: 450,
    pointY: 180,
    boxX: 100,
    boxY: 40,
    title: 'Destaque',
    color: orange,
    value: 93,
    suffix: '%',
    bigNumberLabel: 'execução financeira',
    bigNumberFontSize: 48,
    boxWidth: 220,
    boxHeight: 160,
  }}
/>

<Story
  name="Currency"
  args={{
    pointX: 500,
    pointY: 200,
    boxX: 120,
    boxY: 60,
    title: 'Pico historico',
    subtitle: 'Maior valor no periodo',
    color: blue,
    value: '82.731',
    suffix: ' mi',
    bigNumberLabel: 'valor investido (R$)',
    bigNumberFontSize: 40,
    boxWidth: 250,
    boxHeight: 200,
  }}
/>

<Story
  name="Right Connector"
  args={{
    pointX: 150,
    pointY: 200,
    boxX: 280,
    boxY: 50,
    title: 'Recorde',
    color: red,
    value: '3.47',
    suffix: ' bi',
    bigNumberLabel: 'receita bruta (R$)',
    bigNumberFontSize: 44,
    boxWidth: 230,
    boxHeight: 160,
    circleRadius: 14,
  }}
/>

<Story
  name="Compact"
  args={{
    pointX: 400,
    pointY: 160,
    boxX: 100,
    boxY: 80,
    title: 'Taxa',
    color: teal,
    value: '67,8',
    suffix: '%',
    bigNumberLabel: 'ocupação',
    bigNumberFontSize: 36,
    boxWidth: 180,
    boxHeight: 140,
  }}
/>
