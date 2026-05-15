<script lang="ts">
  import XAxis from '../lib/components/atoms/XAxis.svelte';

  interface Props {
    innerHeight?: number;
    innerWidth?: number;
    label?: string;
    color?: string;
    fontSize?: number;
    rotate?: number;
    showLine?: boolean;
  }

  let {
    innerHeight = 160,
    innerWidth = 400,
    label = '',
    color = '#64748b',
    fontSize = 12,
    rotate = 0,
    showLine = true,
  }: Props = $props();

  const ticks = $derived([
    { value: 'Jan', x: innerWidth * 0.1 },
    { value: 'Feb', x: innerWidth * 0.25 },
    { value: 'Mar', x: innerWidth * 0.4 },
    { value: 'Apr', x: innerWidth * 0.55 },
    { value: 'May', x: innerWidth * 0.7 },
    { value: 'Jun', x: innerWidth * 0.85 },
  ]);
</script>

<svg width={innerWidth + 40} height={innerHeight + 60} style="background: #fafafa; border: 1px solid #eee;">
  <g transform="translate(20, 10)">
    <XAxis {ticks} {innerHeight} {innerWidth} {label} {color} {fontSize} {rotate} {showLine} />
  </g>
</svg>
