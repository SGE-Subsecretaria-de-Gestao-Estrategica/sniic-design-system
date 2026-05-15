<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BubbleWithLabelDemo from './_BubbleWithLabelDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/BubbleWithLabel',
    component: BubbleWithLabelDemo,
    tags: ['autodocs'],
    argTypes: {
      r:              { control: { type: 'range', min: 5, max: 60, step: 1 } },
      fill:           { control: 'color' },
      opacity:        { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
      stroke:         { control: 'color' },
      strokeWidth:    { control: { type: 'range', min: 0, max: 4, step: 0.5 } },
      labelFontSize:  { control: { type: 'range', min: 6, max: 20, step: 1 } },
      ringGap:        { control: { type: 'range', min: 0, max: 10, step: 1 } },
      ringStrokeWidth:{ control: { type: 'range', min: 0, max: 4, step: 0.5 } },
      ringOpacity:    { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    },
  });
</script>

<Story
  name="Default"
  args={{
    r: 30,
    fill: '#4271b5',
    opacity: 0.75,
    label: 'SP',
  }}
/>

<Story
  name="With Ring"
  args={{
    r: 30,
    fill: '#48a89c',
    opacity: 0.85,
    label: 'RJ',
    ringGap: 4,
    ringStroke: '#48a89c',
    ringStrokeWidth: 1.5,
    ringOpacity: 0.4,
  }}
/>

<Story
  name="Small (no label)"
  args={{
    r: 8,
    fill: '#ea662f',
    opacity: 0.75,
    label: 'AM',
    minLabelRadius: 10,
  }}
/>

<Story
  name="Large"
  args={{
    r: 50,
    fill: '#4271b5',
    opacity: 0.6,
    label: 'MG',
    labelFontSize: 16,
    stroke: '#4271b5',
    strokeWidth: 1.5,
  }}
/>
