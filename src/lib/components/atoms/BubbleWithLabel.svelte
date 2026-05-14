<script lang="ts">
	import { getContrastColor } from '../../utils/colorContrast.js';

	interface Props {
		r: number;
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
		r,
		fill = '#4271b5',
		opacity = 0.75,
		stroke,
		strokeWidth = 0,
		label,
		minLabelRadius = 10,
		labelFontSize = 9,
		labelFontWeight = 700,
		ringGap = 0,
		ringStroke,
		ringStrokeWidth = 0,
		ringOpacity = 0.5,
	}: Props = $props();

	const showLabel = $derived(!!label && r >= minLabelRadius);
	const showRing = $derived(ringGap > 0 && ringStrokeWidth > 0);
</script>

{#if showRing}
	<circle
		r={r + ringGap}
		fill="none"
		stroke={ringStroke ?? fill}
		stroke-width={ringStrokeWidth}
		opacity={ringOpacity}
	/>
{/if}
<circle
	{r}
	{fill}
	{opacity}
	stroke={stroke}
	stroke-width={strokeWidth > 0 ? strokeWidth : undefined}
/>
{#if showLabel}
	<text
		text-anchor="middle"
		dy="0.35em"
		font-size={labelFontSize}
		font-weight={labelFontWeight}
		fill={getContrastColor(fill)}
		pointer-events="none"
	>{label}</text>
{/if}
