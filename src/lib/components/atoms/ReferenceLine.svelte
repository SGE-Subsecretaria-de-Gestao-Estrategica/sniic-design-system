<script lang="ts">
	import { typography } from '../../tokens.js';

	interface Props {
		position: number;
		length: number;
		direction?: 'vertical' | 'horizontal';
		color?: string;
		strokeWidth?: number;
		dashed?: boolean;
		dashArray?: string;
		label?: string;
		labelOffset?: number;
		labelFontSize?: number;
		labelColor?: string;
		fontFamily?: string;
		extendBefore?: number;
	}

	let {
		position,
		length,
		direction = 'vertical',
		color = '#000000',
		strokeWidth = 0.5,
		dashed = false,
		dashArray,
		label,
		labelOffset = -12,
		labelFontSize = 10,
		labelColor,
		fontFamily = typography.chartValueFontFamily,
		extendBefore = 0,
	}: Props = $props();

	const dash = $derived(dashArray ?? (dashed ? '4,3' : undefined));
	const textColor = $derived(labelColor ?? color);
</script>

{#if direction === 'vertical'}
	<line
		x1={position}
		x2={position}
		y1={-extendBefore}
		y2={length}
		stroke={color}
		stroke-width={strokeWidth}
		stroke-dasharray={dash}
		shape-rendering="crispEdges"
	/>
	{#if label}
		<text
			x={position + 4}
			y={labelOffset}
			font-size={labelFontSize}
			font-weight="500"
			font-family={fontFamily}
			fill={textColor}
		>{label}</text>
	{/if}
{:else}
	<line
		x1={-extendBefore}
		x2={length}
		y1={position}
		y2={position}
		stroke={color}
		stroke-width={strokeWidth}
		stroke-dasharray={dash}
		shape-rendering="crispEdges"
	/>
	{#if label}
		<text
			x={length + 4}
			y={position}
			dy="0.35em"
			font-size={labelFontSize}
			font-weight="500"
			font-family={fontFamily}
			fill={textColor}
		>{label}</text>
	{/if}
{/if}
