<script lang="ts">
	import { typography } from '../../tokens.js';
	import { getContrastColor } from '../../utils/colorContrast.js';
	import { measureTextWidth } from '../../utils/labelHelpers.js';
	import BarRect from '../atoms/BarRect.svelte';

	interface LegendBarItem {
		label: string;
		color: string;
	}

	interface Props {
		items: LegendBarItem[];
		y: number;
		width: number;
		height?: number;
		textPadding?: number;
		strokeWidth?: number;
		fontSize?: number;
		fontFamily?: string;
		fontWeight?: string;
		/** When true, label color adapts to background contrast. Otherwise uses black. */
		contrastLabels?: boolean;
		/** When true, the legend bar is centered around x=0. */
		centered?: boolean;
	}

	let {
		items,
		y,
		width,
		height = 34,
		textPadding = 12,
		strokeWidth = 0.5,
		fontSize = typography.sizes.sm,
		fontFamily = typography.chartValueFontFamily,
		fontWeight = '600',
		contrastLabels = true,
		centered = false,
	}: Props = $props();

	const segW = $derived(
		items.length > 0
			? Math.max(...items.map((item) => measureTextWidth(item.label, fontSize, fontFamily, Number(fontWeight)))) + textPadding * 2
			: 0,
	);
	const totalW = $derived(segW * items.length);
	const offsetX = $derived(centered ? (width - totalW) / 2 : 0);
</script>

<g transform="translate({offsetX}, 0)">
<!-- Colored segments with labels -->
{#each items as item, i (item.label)}
	<BarRect
		x={i * segW}
		{y}
		width={segW}
		{height}
		fill={item.color}
		shapeRendering="crispEdges"
	/>
	<text
		x={i * segW + textPadding}
		y={y + height / 2}
		dy="0.35em"
		font-size={fontSize}
		font-weight={fontWeight}
		font-family={fontFamily}
		fill={contrastLabels ? getContrastColor(item.color) : 'var(--chart-fg-strong, #000000)'}
	>{item.label}</text>
{/each}

<!-- Divider lines between segments -->
{#each { length: Math.max(0, items.length - 1) } as _, i (i)}
	<line
		x1={(i + 1) * segW}
		y1={y}
		x2={(i + 1) * segW}
		y2={y + height}
		stroke="var(--chart-fg-strong, #000000)"
		stroke-width={strokeWidth}
		shape-rendering="crispEdges"
	/>
{/each}

<!-- Outer border -->
<rect
	x={0}
	{y}
	width={totalW}
	{height}
	fill="none"
	stroke="var(--chart-fg-strong, #000000)"
	stroke-width={strokeWidth}
	shape-rendering="crispEdges"
/>
</g>
