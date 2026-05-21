<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MunicipalityCategoryIconsDemo from './_MunicipalityCategoryIconsDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/Icons/Municipality Categories',
    component: MunicipalityCategoryIconsDemo,
    tags: ['autodocs'],
    argTypes: {
      size:  { control: { type: 'range', min: 16, max: 128, step: 8 } },
      color: { control: 'color' },
    },
  });
</script>

<Story
  name="All Icons"
  args={{
    size: 64,
    color: '#333333',
  }}
/>

<Story
  name="Small (24px)"
  args={{
    size: 24,
    color: '#333333',
  }}
/>

<Story
  name="Large (96px)"
  args={{
    size: 96,
    color: '#4271b5',
  }}
/>
