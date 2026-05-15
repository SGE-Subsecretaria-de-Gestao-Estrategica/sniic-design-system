<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LegendDemo from './_LegendDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/Legend',
    component: LegendDemo,
    tags: ['autodocs'],
    argTypes: {
      swatch:    { control: 'select', options: ['rect', 'circle'] },
      direction: { control: 'select', options: ['row', 'col'] },
      spacing:   { control: { type: 'range', min: 40, max: 160, step: 10 } },
      fontSize:  { control: { type: 'range', min: 8, max: 18, step: 1 } },
      color:     { control: 'color' },
    },
  });
</script>

<Story
  name="Row with Rects"
  args={{
    swatch: 'rect',
    direction: 'row',
    spacing: 100,
  }}
/>

<Story
  name="Row with Circles"
  args={{
    swatch: 'circle',
    direction: 'row',
    spacing: 100,
  }}
/>

<Story
  name="Column"
  args={{
    swatch: 'rect',
    direction: 'col',
    spacing: 20,
  }}
/>

<Story
  name="Compact"
  args={{
    swatch: 'circle',
    direction: 'row',
    spacing: 80,
    fontSize: 10,
  }}
/>
