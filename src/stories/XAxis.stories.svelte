<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import XAxisDemo from './_XAxisDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/XAxis',
    component: XAxisDemo,
    tags: ['autodocs'],
    argTypes: {
      innerHeight: { control: { type: 'range', min: 80, max: 300, step: 10 } },
      innerWidth:  { control: { type: 'range', min: 200, max: 600, step: 20 } },
      fontSize:    { control: { type: 'range', min: 8, max: 18, step: 1 } },
      rotate:      { control: { type: 'range', min: -90, max: 0, step: 5 } },
      color:       { control: 'color' },
      showLine:    { control: 'boolean' },
    },
  });
</script>

<Story
  name="Default"
  args={{
    innerHeight: 160,
    innerWidth: 400,
    showLine: true,
  }}
/>

<Story
  name="With Label"
  args={{
    innerHeight: 160,
    innerWidth: 400,
    label: 'Meses',
    showLine: true,
  }}
/>

<Story
  name="Rotated Labels"
  args={{
    innerHeight: 160,
    innerWidth: 400,
    rotate: -45,
    showLine: true,
  }}
/>

<Story
  name="No Line"
  args={{
    innerHeight: 160,
    innerWidth: 400,
    showLine: false,
    color: '#555555',
    fontSize: 10,
  }}
/>
