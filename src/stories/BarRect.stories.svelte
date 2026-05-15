<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BarRectDemo from './_BarRectDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/BarRect',
    component: BarRectDemo,
    tags: ['autodocs'],
    argTypes: {
      width:  { control: { type: 'range', min: 10, max: 280, step: 5 } },
      height: { control: { type: 'range', min: 5, max: 80, step: 2 } },
      rx:     { control: { type: 'range', min: 0, max: 20, step: 1 } },
      fill:   { control: 'color' },
      stroke: { control: 'color' },
      strokeWidth: { control: { type: 'range', min: 0, max: 4, step: 0.5 } },
    },
  });
</script>

<Story
  name="Default"
  args={{
    x: 20,
    y: 20,
    width: 200,
    height: 40,
    fill: '#4271b5',
  }}
/>

<Story
  name="Rounded"
  args={{
    x: 20,
    y: 20,
    width: 200,
    height: 40,
    fill: '#48a89c',
    rx: 6,
  }}
/>

<Story
  name="With Stroke"
  args={{
    x: 20,
    y: 20,
    width: 200,
    height: 40,
    fill: '#ea662f',
    stroke: '#000000',
    strokeWidth: 1,
    shapeRendering: 'crispEdges',
  }}
/>

<Story
  name="With Title"
  args={{
    x: 20,
    y: 20,
    width: 200,
    height: 40,
    fill: '#4271b5',
    title: 'Hover to see tooltip',
  }}
/>
