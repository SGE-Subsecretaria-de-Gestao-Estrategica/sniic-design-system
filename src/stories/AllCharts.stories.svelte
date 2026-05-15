<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import AllChartsOverview from './_AllChartsOverview.svelte';

  const { Story } = defineMeta({
    title: 'Design System/All Charts',
    component: AllChartsOverview,
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
      backgrounds: { default: 'cream' },
    },
  });
</script>

<Story name="Overview" />
