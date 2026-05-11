<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Tooltip from '../lib/components/molecules/Tooltip.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/Tooltip',
    component: Tooltip,
    tags: ['autodocs'],
    argTypes: {
      offsetX: { control: { type: 'range', min: -40, max: 40, step: 2 } },
      offsetY: { control: { type: 'range', min: -60, max: 20, step: 2 } },
    },
  });
</script>

<Story
  name="Default"
  args={{
    visible: true,
    x: 200,
    y: 150,
    html: '<strong>Série A</strong><br/>Valor: 42',
  }}
/>

<Story
  name="Multi-line"
  args={{
    visible: true,
    x: 200,
    y: 150,
    html: '<strong>Região Norte</strong><br/>População: 1.2M<br/>Crescimento: +3.7%',
  }}
/>

<Story
  name="Custom Offset"
  args={{
    visible: true,
    x: 200,
    y: 150,
    html: '<strong>Ponto</strong><br/>Valor: 87.3',
    offsetX: -100,
    offsetY: -50,
  }}
/>

<Story
  name="Hidden"
  args={{
    visible: false,
    x: 200,
    y: 150,
    html: 'This should not be visible',
  }}
/>
