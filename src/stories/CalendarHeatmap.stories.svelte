<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CalendarHeatmap from '../lib/components/CalendarHeatmap.svelte';
  import { colorScales } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/CalendarHeatmap',
    component: CalendarHeatmap,
    tags: ['autodocs'],
    argTypes: {
      height:     { control: { type: 'range', min: 120, max: 300, step: 10 } },
      cellRadius: { control: { type: 'range', min: 0, max: 6, step: 1 } },
      cellGap:    { control: { type: 'range', min: 1, max: 6, step: 1 } },
      showLegend: { control: 'boolean' },
    },
  });

  function makeYear(year, seed = 1) {
    const data = [];
    let n = seed;
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    const d = new Date(start);
    while (d <= end) {
      n = (n * 1664525 + 1013904223) & 0xffffffff;
      const hasValue = Math.abs(n) % 100 > 20;
      if (hasValue) {
        data.push({
          date: d.toISOString().slice(0, 10),
          value: Math.abs(n % 50),
        });
      }
      d.setDate(d.getDate() + 1);
    }
    return data;
  }
</script>

<Story
  name="Full Year"
  args={{
    height: 160,
    showLegend: true,
    data: makeYear(2025),
  }}
/>

<Story
  name="Blue Scale"
  args={{
    height: 160,
    showLegend: true,
    colorRange: colorScales.blue,
    data: makeYear(2025, 42),
  }}
/>

<Story
  name="Purple Scale"
  args={{
    height: 160,
    showLegend: true,
    colorRange: colorScales.purple,
    data: makeYear(2024, 7),
  }}
/>
