<script lang="ts">
  import ReferenceLine from '../lib/components/atoms/ReferenceLine.svelte';

  interface Props {
    position?: number;
    length?: number;
    direction?: 'vertical' | 'horizontal';
    color?: string;
    strokeWidth?: number;
    dashed?: boolean;
    label?: string;
    labelOffset?: number;
    labelFontSize?: number;
    labelColor?: string;
    extendBefore?: number;
  }

  let {
    position = 150,
    length = 200,
    direction = 'vertical',
    color = '#000000',
    strokeWidth = 1,
    dashed = false,
    label = undefined,
    labelOffset = -12,
    labelFontSize = 10,
    labelColor = undefined,
    extendBefore = 0,
  }: Props = $props();
</script>

<svg width={400} height={260} style="background: #fafafa; border: 1px solid #eee;">
  <g transform="translate(40, 30)">
    <ReferenceLine {position} {length} {direction} {color} {strokeWidth} {dashed} {label} {labelOffset} {labelFontSize} {labelColor} {extendBefore} />
  </g>
</svg>
