<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AnnotationBoxDemo from './_AnnotationBoxDemo.svelte';
  import { orange, blue, red, teal } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Molecules/AnnotationBox',
    component: AnnotationBoxDemo,
    tags: ['autodocs'],
    argTypes: {
      boxWidth:      { control: { type: 'range', min: 120, max: 300, step: 10 } },
      circleRadius:  { control: { type: 'range', min: 8, max: 30, step: 1 } },
      color:         { control: 'color' },
    },
  });
</script>

<Story
  name="Default"
  args={{
    pointX: 450,
    pointY: 180,
    boxX: 160,
    boxY: 100,
    title: 'Title',
    subtitle: 'Subtitle with details\nand more details',
    color: orange,
  }}
/>

<Story
  name="Custom Width"
  args={{
    pointX: 500,
    pointY: 150,
    boxX: 240,
    boxY: 60,
    title: 'Pico historico',
    subtitle: 'Maior valor registrado\nno periodo analisado',
    color: blue,
    boxWidth: 180,
  }}
/>

<Story
  name="Right Connector"
  args={{
    pointX: 150,
    pointY: 200,
    boxX: 260,
    boxY: 120,
    title: 'Inicio da alta',
    subtitle: 'Crescimento\nacelerado',
    color: red,
    boxWidth: 180,
    circleRadius: 14,
  }}
/>

<Story
  name="No Subtitle"
  args={{
    pointX: 350,
    pointY: 175,
    boxX: 100,
    boxY: 130,
    title: 'Destaque',
    color: teal,
    boxWidth: 160,
  }}
/>
