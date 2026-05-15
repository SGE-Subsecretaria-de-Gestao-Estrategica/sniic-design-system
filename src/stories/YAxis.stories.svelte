<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import YAxisDemo from './_YAxisDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/YAxis',
    component: YAxisDemo,
    tags: ['autodocs'],
    argTypes: {
      innerHeight: { control: { type: 'range', min: 100, max: 400, step: 10 } },
      fontSize:    { control: { type: 'range', min: 8, max: 18, step: 1 } },
      labelOffset: { control: { type: 'range', min: 20, max: 60, step: 2 } },
      tickOffset:  { control: { type: 'range', min: -20, max: 0, step: 1 } },
      color:       { control: 'color' },
      showLine:    { control: 'boolean' },
    },
  });
</script>

<Story
  name="Default"
  args={{
    innerHeight: 200,
    showLine: true,
  }}
/>

<Story
  name="With Label"
  args={{
    innerHeight: 200,
    label: 'Valores',
    showLine: true,
  }}
/>

<Story
  name="No Line"
  args={{
    innerHeight: 200,
    showLine: false,
    color: '#a0a0a0',
    fontSize: 11,
    tickOffset: -8,
  }}
/>
