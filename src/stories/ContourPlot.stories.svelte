<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ContourPlot from '../lib/components/ContourPlot.svelte';
  import { colorScales } from '../lib/tokens.js';

  const { Story } = defineMeta({
    title: 'Charts/ContourPlot',
    component: ContourPlot,
    tags: ['autodocs'],
    argTypes: {
      height:     { control: { type: 'range', min: 300, max: 700, step: 50 } },
      thresholds: { control: { type: 'range', min: 5, max: 40, step: 5 } },
      bandwidth:  { control: { type: 'range', min: 5, max: 50, step: 5 } },
      showPoints: { control: 'boolean' },
      showLegend: { control: 'boolean' },
      showGrid:   { control: 'boolean' },
    },
  });

  // Two bivariate normal clusters
  function makeGaussianClusters(n, seed = 42) {
    const pts = [];
    let s = seed;
    function rng() {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    }
    function boxMuller() {
      const u1 = rng() || 0.001;
      const u2 = rng();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }
    for (let i = 0; i < n; i++) {
      if (rng() < 0.6) {
        pts.push({ x: boxMuller() * 15 + 50, y: boxMuller() * 12 + 60 });
      } else {
        pts.push({ x: boxMuller() * 10 + 80, y: boxMuller() * 18 + 30 });
      }
    }
    return pts;
  }
</script>

<Story
  name="Default"
  args={{
    height: 400,
    thresholds: 20,
    bandwidth: 20,
    showPoints: false,
    showLegend: true,
    showGrid: true,
    data: makeGaussianClusters(500),
  }}
/>

<Story
  name="With Points"
  args={{
    height: 400,
    thresholds: 15,
    bandwidth: 15,
    showPoints: true,
    showLegend: true,
    showGrid: true,
    xLabel: 'Longitude',
    yLabel: 'Latitude',
    colorRange: colorScales.blue,
    data: makeGaussianClusters(300, 7),
  }}
/>

<Story
  name="Dense"
  args={{
    height: 450,
    thresholds: 30,
    bandwidth: 12,
    showPoints: false,
    showLegend: true,
    showGrid: false,
    colorRange: colorScales.teal,
    data: makeGaussianClusters(1000, 99),
  }}
/>
