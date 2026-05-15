<script lang="ts">
  import GridLines from '../lib/components/atoms/GridLines.svelte';

  interface Props {
    type?: 'horizontal' | 'vertical';
    color?: string;
    dashed?: boolean;
    strokeWidth?: number;
    opacity?: number;
  }

  let {
    type = 'horizontal',
    color = '#e2e8f0',
    dashed = false,
    strokeWidth = 1,
    opacity = 1,
  }: Props = $props();

  const chartW = 400;
  const chartH = 200;

  const positions = $derived(
    type === 'horizontal'
      ? [0, chartH * 0.25, chartH * 0.5, chartH * 0.75, chartH]
      : [0, chartW * 0.2, chartW * 0.4, chartW * 0.6, chartW * 0.8, chartW]
  );

  const length = $derived(type === 'horizontal' ? chartW : chartH);
</script>

<svg width={chartW + 20} height={chartH + 20} style="background: #fafafa; border: 1px solid #eee;">
  <g transform="translate(10, 10)">
    <GridLines {type} {positions} {length} {color} {dashed} {strokeWidth} {opacity} />
  </g>
</svg>
