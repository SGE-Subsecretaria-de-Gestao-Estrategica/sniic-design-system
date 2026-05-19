<script lang="ts">
  import AnnotationBox from '../lib/components/molecules/AnnotationBox.svelte';
  import BigNumber from '../lib/components/BigNumber.svelte';
  import { orange, teal } from '../lib/tokens.js';

  interface Props {
    pointX?: number;
    pointY?: number;
    boxX?: number;
    boxY?: number;
    title?: string;
    subtitle?: string;
    color?: string;
    boxWidth?: number;
    boxHeight?: number;
    circleRadius?: number;
    value?: string | number;
    suffix?: string;
    bigNumberLabel?: string;
    bigNumberFontSize?: number;
  }

  let {
    pointX = 450,
    pointY = 180,
    boxX = 100,
    boxY = 40,
    title = 'Destaque',
    subtitle = '',
    color = orange,
    boxWidth = 220,
    boxHeight = 160,
    circleRadius = 16,
    value = 93,
    suffix = '%',
    bigNumberLabel = 'execução financeira',
    bigNumberFontSize = 48,
  }: Props = $props();
</script>

<svg width={700} height={350}>
  <circle cx={pointX} cy={pointY} r="4" fill={teal} />
  <AnnotationBox
    {pointX}
    {pointY}
    {boxX}
    {boxY}
    {title}
    {subtitle}
    {color}
    {boxWidth}
    {boxHeight}
    {circleRadius}
  >
    <BigNumber {value} {suffix} label={bigNumberLabel} fontSize={bigNumberFontSize} shadowDepth={4} />
  </AnnotationBox>
</svg>
