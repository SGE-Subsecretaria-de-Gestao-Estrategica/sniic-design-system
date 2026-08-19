<script lang="ts">
	import Group from '$lib/core/components/Group.svelte';
	import Text from '$lib/core/components/Text.svelte';
	import Bar from '$lib/core/components/shape/Bar.svelte';
	import Line from '$lib/core/components/shape/Line.svelte';
	import { DefaultTheme, getChartTheme, resolveThemeStyles } from '$lib/core/theme';
	import type { TextStyle } from '$lib/core/theme/types';
	import getStringWidth from '$lib/core/utils/getStringWidth';
	import Point from '$lib/entities/Point';
	import { getContrastColor } from '../../utils/colorContrast.js';

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
		/** Divider and border colour; defaults to the theme's strongest neutral. */
		stroke?: string;
		fontSize?: number;
		fontFamily?: string;
		fontWeight?: string;
		/** When true, label color adapts to background contrast. Otherwise uses the theme text color. */
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
		stroke,
		fontSize,
		fontFamily,
		fontWeight = '600',
		contrastLabels = true,
		centered = false,
	}: Props = $props();

	const theme = getChartTheme();

	let textStyle = $derived(
		resolveThemeStyles<TextStyle>(
			{ fill: undefined, fontSize, fontFamily, fontWeight },
			theme?.text,
			DefaultTheme.text,
		),
	);

	let chromeStroke = $derived(
		stroke ?? theme?.palette?.neutral?.[300] ?? DefaultTheme.palette.neutral[300],
	);

	let measuredFontSize = $derived(Number(textStyle.fontSize) || DefaultTheme.text.fontSize);

	function labelWidth(label: string) {
		return (
			getStringWidth(
				label,
				`font-size: ${measuredFontSize}px; font-family: ${textStyle.fontFamily}; font-weight: ${textStyle.fontWeight}`,
			) ?? label.length * measuredFontSize * 0.62
		);
	}

	// Every segment takes the width of the widest label, so the bar reads as
	// one evenly divided strip rather than ragged blocks.
	let segW = $derived(
		items.length > 0
			? Math.max(...items.map((item) => labelWidth(item.label))) + textPadding * 2
			: 0,
	);
	let totalW = $derived(segW * items.length);
	let offsetX = $derived(centered ? (width - totalW) / 2 : 0);
</script>

<Group class="legend-bar" left={offsetX}>
	{#each items as item, i (item.label)}
		<Bar
			x={i * segW}
			{y}
			width={segW}
			{height}
			fill={item.color}
			rx={0}
			shape-rendering="crispEdges"
		/>
		<Text
			x={i * segW + textPadding}
			y={y + height / 2}
			verticalAnchor="middle"
			fontSize={textStyle.fontSize}
			fontFamily={textStyle.fontFamily}
			fontWeight={textStyle.fontWeight}
			fill={contrastLabels ? getContrastColor(item.color) : textStyle.fill}
			text={item.label}
		/>
	{/each}

	<!-- Dividers between segments -->
	{#each { length: Math.max(0, items.length - 1) } as _, i (i)}
		<Line
			from={new Point({ x: (i + 1) * segW, y })}
			to={new Point({ x: (i + 1) * segW, y: y + height })}
			stroke={chromeStroke}
			{strokeWidth}
		/>
	{/each}

	<!-- Outer border -->
	<Bar
		x={0}
		{y}
		width={totalW}
		{height}
		fill="none"
		rx={0}
		stroke={chromeStroke}
		{strokeWidth}
		shape-rendering="crispEdges"
	/>
</Group>
