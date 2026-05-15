<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import GridLinesDemo from './_GridLinesDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/GridLines',
    component: GridLinesDemo,
    tags: ['autodocs'],
    argTypes: {
      type:        { control: 'select', options: ['horizontal', 'vertical'] },
      color:       { control: 'color' },
      dashed:      { control: 'boolean' },
      strokeWidth: { control: { type: 'range', min: 0.5, max: 3, step: 0.5 } },
      opacity:     { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    },
  });
</script>

<Story
  name="Horizontal"
  args={{
    type: 'horizontal',
    color: '#e2e8f0',
    dashed: false,
  }}
/>

<Story
  name="Vertical"
  args={{
    type: 'vertical',
    color: '#e2e8f0',
    dashed: false,
  }}
/>

<Story
  name="Dashed"
  args={{
    type: 'horizontal',
    color: '#000000',
    dashed: true,
    opacity: 0.15,
  }}
/>

<Story
  name="Thick Colored"
  args={{
    type: 'vertical',
    color: '#4271b5',
    strokeWidth: 2,
    opacity: 0.3,
  }}
/>
