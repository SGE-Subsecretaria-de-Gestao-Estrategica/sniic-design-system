<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LegendBarDemo from './_LegendBarDemo.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/LegendBar',
    component: LegendBarDemo,
    tags: ['autodocs'],
    argTypes: {
      height:      { control: { type: 'range', min: 20, max: 60, step: 2 } },
      textPadding: { control: { type: 'range', min: 4, max: 24, step: 2 } },
      strokeWidth: { control: { type: 'range', min: 0, max: 3, step: 0.5 } },
      contrastLabels: { control: 'boolean' },
    },
  });
</script>

<Story
  name="Default"
  args={{
    height: 34,
    textPadding: 12,
    strokeWidth: 0.5,
    contrastLabels: true,
  }}
/>

<Story
  name="Tall"
  args={{
    height: 50,
    textPadding: 16,
    strokeWidth: 1,
    contrastLabels: true,
  }}
/>

<Story
  name="No Contrast Labels"
  args={{
    height: 34,
    textPadding: 12,
    strokeWidth: 0.5,
    contrastLabels: false,
  }}
/>
