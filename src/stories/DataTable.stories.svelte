<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import DataTableDemo from './_DataTableDemo.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/DataTable',
    component: DataTableDemo,
    tags: ['autodocs'],
    argTypes: {
      minRowHeight: { control: { type: 'range', min: 24, max: 60, step: 2 } },
      headerColor: { control: 'color' },
      lineColor: { control: 'color' },
      textColor: { control: 'color' },
    },
  });
</script>

<Story name="Default" />

<Story
  name="Custom Colors"
  args={{
    headerColor: '#4271b5',
    lineColor: '#4271b5',
  }}
/>
