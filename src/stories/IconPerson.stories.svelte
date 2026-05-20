<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import IconPerson from '../lib/components/atoms/icons/IconPerson.svelte';

  const { Story } = defineMeta({
    title: 'Atoms/Icons/Person',
    component: IconPerson,
    tags: ['autodocs'],
    argTypes: {
      size:  { control: { type: 'range', min: 16, max: 128, step: 8 } },
      color: { control: 'color' },
      title: { control: 'text' },
    },
  });
</script>

<Story
  name="Default"
  args={{
    size: 24,
    color: '#333333',
  }}
/>

<Story
  name="Large"
  args={{
    size: 64,
    color: '#333333',
  }}
/>

<Story
  name="Colored"
  args={{
    size: 48,
    color: '#4271b5',
  }}
/>
