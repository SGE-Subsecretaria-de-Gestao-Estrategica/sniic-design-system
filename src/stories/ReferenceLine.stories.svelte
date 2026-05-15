<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ReferenceLineDemo from './_ReferenceLineDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/ReferenceLine',
    component: ReferenceLineDemo,
    tags: ['autodocs'],
    argTypes: {
      position:    { control: { type: 'range', min: 0, max: 300, step: 5 } },
      length:      { control: { type: 'range', min: 50, max: 300, step: 10 } },
      direction:   { control: 'select', options: ['vertical', 'horizontal'] },
      color:       { control: 'color' },
      strokeWidth: { control: { type: 'range', min: 0.5, max: 4, step: 0.5 } },
      dashed:      { control: 'boolean' },
      extendBefore:{ control: { type: 'range', min: 0, max: 30, step: 2 } },
    },
  });
</script>

<Story
  name="Vertical Solid"
  args={{
    position: 150,
    length: 200,
    direction: 'vertical',
    color: '#000000',
    strokeWidth: 1,
  }}
/>

<Story
  name="Vertical Dashed"
  args={{
    position: 150,
    length: 200,
    direction: 'vertical',
    color: '#ea662f',
    strokeWidth: 1,
    dashed: true,
  }}
/>

<Story
  name="Horizontal"
  args={{
    position: 100,
    length: 300,
    direction: 'horizontal',
    color: '#4271b5',
    strokeWidth: 1,
  }}
/>

<Story
  name="With Label"
  args={{
    position: 150,
    length: 200,
    direction: 'vertical',
    color: '#ecb42d',
    strokeWidth: 1,
    dashed: true,
    label: 'Media 52.3%',
    labelColor: '#ecb42d',
    extendBefore: 8,
  }}
/>
