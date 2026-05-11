<script lang="ts">
  import AnnotationBox from '../lib/components/molecules/AnnotationBox.svelte';
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
    circleRadius?: number;
  }

  let {
    pointX = 450,
    pointY = 180,
    boxX = 160,
    boxY = 100,
    title = 'Title',
    subtitle = '',
    color = orange,
    boxWidth = 220,
    circleRadius = 16,
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
    {circleRadius}
  />
</svg>
