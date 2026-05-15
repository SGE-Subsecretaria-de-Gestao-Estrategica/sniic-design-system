<script lang="ts">
  import BubbleWithLabel from '../lib/components/atoms/BubbleWithLabel.svelte';

  interface Props {
    r?: number;
    fill?: string;
    opacity?: number;
    stroke?: string;
    strokeWidth?: number;
    label?: string;
    minLabelRadius?: number;
    labelFontSize?: number;
    labelFontWeight?: number;
    ringGap?: number;
    ringStroke?: string;
    ringStrokeWidth?: number;
    ringOpacity?: number;
  }

  let {
    r = 30,
    fill = '#4271b5',
    opacity = 0.75,
    stroke = undefined,
    strokeWidth = 0,
    label = 'AB',
    minLabelRadius = 10,
    labelFontSize = 12,
    labelFontWeight = 700,
    ringGap = 0,
    ringStroke = undefined,
    ringStrokeWidth = 0,
    ringOpacity = 0.5,
  }: Props = $props();
</script>

<svg width={200} height={200} style="background: #fafafa; border: 1px solid #eee;">
  <g transform="translate(100, 100)">
    <BubbleWithLabel {r} {fill} {opacity} {stroke} {strokeWidth} {label} {minLabelRadius} {labelFontSize} {labelFontWeight} {ringGap} {ringStroke} {ringStrokeWidth} {ringOpacity} />
  </g>
</svg>
