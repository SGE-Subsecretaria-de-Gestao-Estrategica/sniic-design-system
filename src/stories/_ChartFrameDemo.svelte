<script lang="ts">
  import ChartFrame from '../lib/components/molecules/ChartFrame.svelte';
  import type { Margin } from '../lib/tokens.js';

  interface Props {
    width?: number;
    height?: number;
    margin?: Margin;
    responsive?: boolean;
    label?: string;
    fillColor?: string;
    textColor?: string;
  }

  let {
    width = 600,
    height = 400,
    margin = undefined,
    responsive = false,
    label = 'Chart area',
    fillColor = '#f0f0f0',
    textColor = '#666',
  }: Props = $props();
</script>

<ChartFrame {width} {height} {margin} {responsive}>
  {#snippet children()}
    <rect width="100%" height="100%" fill={fillColor} rx="4" />
    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="14" fill={textColor}>
      {label}
    </text>
  {/snippet}
</ChartFrame>
