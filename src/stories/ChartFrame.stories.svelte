<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChartFrameDemo from './_ChartFrameDemo.svelte';

  const { Story } = defineMeta({
    title: 'Molecules/ChartFrame',
    component: ChartFrameDemo,
    tags: ['autodocs'],
    argTypes: {
      width:  { control: { type: 'range', min: 200, max: 1000, step: 50 } },
      height: { control: { type: 'range', min: 150, max: 800, step: 50 } },
      responsive: { control: 'boolean' },
    },
  });
</script>

<Story
  name="Default"
  args={{
    width: 600,
    height: 400,
    label: '600 x 400 chart area',
  }}
/>

<Story
  name="Custom Size"
  args={{
    width: 800,
    height: 300,
    label: '800 x 300 chart area',
    fillColor: '#e8f4f0',
    textColor: '#265c4f',
  }}
/>

<Story
  name="Custom Margins"
  args={{
    width: 600,
    height: 400,
    margin: { top: 60, right: 60, bottom: 60, left: 60 },
    label: 'Large margins (60px all sides)',
    fillColor: '#fef3e8',
    textColor: '#ea662f',
  }}
/>

<Story
  name="Responsive"
  args={{
    width: 600,
    height: 400,
    responsive: true,
    label: 'Responsive — resizes with container',
    fillColor: '#ede8f4',
    textColor: '#a44c7f',
  }}
/>
