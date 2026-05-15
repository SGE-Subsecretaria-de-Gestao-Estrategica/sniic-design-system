<script lang="ts">
  import YAxis from '../lib/components/atoms/YAxis.svelte';

  interface Props {
    innerHeight?: number;
    label?: string;
    color?: string;
    fontSize?: number;
    labelOffset?: number;
    tickOffset?: number;
    showLine?: boolean;
  }

  let {
    innerHeight = 200,
    label = '',
    color = '#64748b',
    fontSize = 12,
    labelOffset = 36,
    tickOffset = -8,
    showLine = true,
  }: Props = $props();

  const ticks = $derived([
    { value: '0', y: innerHeight },
    { value: '25', y: innerHeight * 0.75 },
    { value: '50', y: innerHeight * 0.5 },
    { value: '75', y: innerHeight * 0.25 },
    { value: '100', y: 0 },
  ]);
</script>

<svg width={120} height={innerHeight + 20} style="background: #fafafa; border: 1px solid #eee;">
  <g transform="translate(60, 10)">
    <YAxis {ticks} {innerHeight} {label} {color} {fontSize} {labelOffset} {tickOffset} {showLine} />
  </g>
</svg>
