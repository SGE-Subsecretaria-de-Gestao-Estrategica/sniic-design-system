<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import StateFlagsDemo from './_StateFlagsDemo.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/Icons/State Flags',
    component: StateFlagsDemo,
    tags: ['autodocs'],
    argTypes: {
      size: { control: { type: 'range', min: 16, max: 128, step: 8 } },
    },
  });
</script>

<Story
  name="All Flags"
  args={{
    size: 32,
  }}
/>

<Story
  name="Small (20px)"
  args={{
    size: 20,
  }}
/>

<Story
  name="Large (64px)"
  args={{
    size: 64,
  }}
/>
