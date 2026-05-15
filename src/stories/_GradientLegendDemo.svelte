<script lang="ts">
  import GradientLegend from '../lib/components/atoms/GradientLegend.svelte';

  interface Props {
    min?: number;
    max?: number;
    width?: number;
    height?: number;
  }

  let {
    min = 0,
    max = 100,
    width = 200,
    height = 8,
  }: Props = $props();

  const colorRange = ['#e8f0fe', '#4271b5'];
</script>

<svg width={width + 20} height={40} style="background: #fafafa; border: 1px solid #eee;">
  <g transform="translate(10, 4)">
    <GradientLegend {colorRange} {min} {max} {width} {height} />
  </g>
</svg>
