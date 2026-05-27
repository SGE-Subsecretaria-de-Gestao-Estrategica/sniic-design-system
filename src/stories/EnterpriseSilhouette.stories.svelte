<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import EnterpriseSilhouetteDemo from './_EnterpriseSilhouetteDemo.svelte';
  import { teal, black } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Molecules/EnterpriseSilhouette',
    component: EnterpriseSilhouetteDemo,
    tags: ['autodocs'],
    argTypes: {
      width:       { control: { type: 'range', min: 600, max: 1200, step: 50 } },
      height:      { control: { type: 'range', min: 400, max: 900, step: 50 } },
      strokeWidth: { control: { type: 'range', min: 1, max: 5, step: 0.5 } },
      strokeColor: { control: 'color' },
    },
  });
</script>

<Story
  name="Default"
  args={{
    width: 900,
    height: 600,
    strokeColor: teal,
    strokeWidth: 2,
  }}
/>

<Story
  name="Dark Outline"
  args={{
    width: 900,
    height: 600,
    strokeColor: black,
    strokeWidth: 3,
  }}
/>
