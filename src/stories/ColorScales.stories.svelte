<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ColorPalette from '../lib/components/ColorPalette.svelte';

  const { Story } = defineMeta({
    title: 'Design System/Color Scales',
    component: ColorPalette,
    tags: ['autodocs'],
    argTypes: {
      background: {
        control: 'radio',
        options: ['light', 'dark'],
        description: 'Preview background to verify legibility in both contexts.',
      },
      view: {
        control: 'radio',
        options: ['swatches', 'gradients'],
        description: 'Swatches shows individual stops; gradients shows continuous transitions.',
      },
    },
  });
</script>

<Story name="Swatches" args={{ view: 'swatches', background: 'light' }} />

<Story name="Swatches Dark" args={{ view: 'swatches', background: 'dark' }} />

<Story name="Gradients" args={{ view: 'gradients', background: 'light' }} />

<Story name="Gradients Dark" args={{ view: 'gradients', background: 'dark' }} />
