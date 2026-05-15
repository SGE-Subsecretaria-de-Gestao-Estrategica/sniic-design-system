<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import GradientLegendDemo from './_GradientLegendDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/GradientLegend',
    component: GradientLegendDemo,
    tags: ['autodocs'],
    argTypes: {
      min:    { control: { type: 'number' } },
      max:    { control: { type: 'number' } },
      width:  { control: { type: 'range', min: 100, max: 400, step: 10 } },
      height: { control: { type: 'range', min: 4, max: 16, step: 1 } },
    },
  });
</script>

<Story
  name="Default"
  args={{
    min: 0,
    max: 100,
    width: 200,
    height: 8,
  }}
/>

<Story
  name="Wide"
  args={{
    min: 0,
    max: 1000,
    width: 350,
    height: 10,
  }}
/>

<Story
  name="Narrow"
  args={{
    min: 0,
    max: 50,
    width: 120,
    height: 6,
  }}
/>
