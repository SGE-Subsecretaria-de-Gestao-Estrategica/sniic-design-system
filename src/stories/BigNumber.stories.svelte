<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BigNumber from '../lib/components/BigNumber.svelte';
  import { orange, blue, teal } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/BigNumber',
    component: BigNumber,
    tags: ['autodocs'],
    argTypes: {
      fontSize:    { control: { type: 'range', min: 32, max: 200, step: 8 } },
      shadowDepth: { control: { type: 'range', min: 0, max: 20, step: 1 } },
      color:       { control: 'color' },
      shadowColor: { control: 'color' },
    },
  });
</script>

<Story
  name="Default"
  args={{
    value: 93,
    suffix: '%',
    fontSize: 96,
    shadowDepth: 8,
  }}
/>

<Story
  name="On Orange Background"
  parameters={{ backgrounds: { default: 'light' } }}
  args={{
    value: 93,
    suffix: '%',
    fontSize: 120,
    shadowDepth: 10,
  }}
/>

<Story
  name="With Label"
  args={{
    value: 1.2,
    suffix: 'M',
    label: 'habitantes',
    fontSize: 96,
    shadowDepth: 8,
  }}
/>

<Story
  name="Blue on Dark"
  args={{
    value: 47,
    suffix: '%',
    label: 'cobertura vacinal',
    fontSize: 80,
    color: '#ffffff',
    shadowColor: blue,
    shadowDepth: 10,
  }}
/>

<Story
  name="Custom Colors"
  args={{
    value: 3.7,
    suffix: 'x',
    label: 'crescimento',
    fontSize: 96,
    color: '#ffffff',
    shadowColor: teal,
    shadowDepth: 8,
  }}
/>
