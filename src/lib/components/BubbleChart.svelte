<script lang="ts" module>
	export interface BubbleDatum {
		label: string;
		x: number;
		y: number;
		size: number;
		group?: string;
	}
</script>

<script lang="ts">
	import { scaleLog, scaleLinear, scaleSqrt, extent, max } from 'd3';
	import { categorical8 } from '../palettes.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import YAxis from './atoms/YAxis.svelte';
	import GridLines from './atoms/GridLines.svelte';
	import Legend from './atoms/Legend.svelte';
	import BubbleWithLabel from './atoms/BubbleWithLabel.svelte';
	import TooltipContainer from './molecules/TooltipContainer.svelte';

	interface Props {
		data?: BubbleDatum[];
		xLabel?: string;
		yLabel?: string;
		sizeLabel?: string;
		groups?: Record<string, string>;
		xScaleType?: 'linear' | 'log';
		yScaleType?: 'linear' | 'log';
		xFormat?: (v: number) => string;
		yFormat?: (v: number) => string;
		tooltipFormat?: (d: BubbleDatum) => string;
		colors?: readonly string[];
		minRadius?: number;
		maxRadius?: number;
	}

	let {
		data = [],
		xLabel = '',
		yLabel = '',
		sizeLabel = '',
		groups = {},
		xScaleType = 'linear',
		yScaleType = 'linear',
		xFormat = (v: number) => v.toLocaleString(),
		yFormat = (v: number) => v.toLocaleString(),
		tooltipFormat,
		colors = categorical8,
		minRadius = 4,
		maxRadius = 24,
	}: Props = $props();

	const MARGIN = { top: 24, right: 24, bottom: 52, left: 72 };

	const groupColorMap = $derived.by(() => {
		if (Object.keys(groups).length > 0) return groups;
		const uniqueGroups = [...new Set(data.map((d) => d.group).filter(Boolean))] as string[];
		return Object.fromEntries(uniqueGroups.map((g, i) => [g, colors[i % colors.length]]));
	});

	function defaultTooltipHtml(d: BubbleDatum): string {
		const lines = [`<strong>${d.label}</strong>`];
		if (xLabel) lines.push(`${xLabel}: ${xFormat(d.x)}`);
		if (yLabel) lines.push(`${yLabel}: ${yFormat(d.y)}`);
		if (sizeLabel) lines.push(`${sizeLabel}: ${d.size.toLocaleString()}`);
		if (d.group) lines.push(`${d.group}`);
		return lines.join('<br/>');
	}

	function bubbleColor(d: BubbleDatum): string {
		if (d.group && groupColorMap[d.group]) return groupColorMap[d.group];
		return colors[0] ?? '#a0a0a0';
	}

	let measuredWidth = $state(0);
	let innerW = $state(0);

	const height = $derived(Math.max(380, measuredWidth * 0.5));
	const innerH = $derived(height - MARGIN.top - MARGIN.bottom);

	const rows = $derived(data.filter((d) => d.x > 0 && d.y > 0));

	const xExtent = $derived(extent(rows, (d) => d.x) as [number, number]);
	const yExtent = $derived(extent(rows, (d) => d.y) as [number, number]);
	const maxSize = $derived(max(rows, (d) => d.size) ?? 1);

	function makeScale(
		type: 'linear' | 'log',
		domain: [number, number],
		range: [number, number],
	) {
		if (type === 'log') return scaleLog().domain(domain).range(range).nice();
		return scaleLinear().domain(domain).range(range).nice();
	}

	const xScale = $derived(
		rows.length > 1
			? makeScale(xScaleType, xExtent, [0, innerW])
			: makeScale(xScaleType, [1, 100], [0, innerW]),
	);

	const yScale = $derived(
		rows.length > 1
			? makeScale(yScaleType, yExtent, [innerH, 0])
			: makeScale(yScaleType, [1, 100], [innerH, 0]),
	);

	const rScale = $derived(scaleSqrt().domain([0, maxSize]).range([minRadius, maxRadius]));

	const xTickValues = $derived(xScale.ticks(5));
	const yTickValues = $derived(yScale.ticks(5));

	const xTicks = $derived(xTickValues.map((v) => ({ value: xFormat(v), x: xScale(v) })));
	const yTicks = $derived(yTickValues.map((v) => ({ value: yFormat(v), y: yScale(v) })));

	const xGridPositions = $derived(xTickValues.map((v) => xScale(v)));
	const yGridPositions = $derived(yTickValues.map((v) => yScale(v)));

	const hasGroups = $derived(Object.keys(groupColorMap).length > 0);

	const regionLegendItems = $derived(
		Object.entries(groupColorMap).map(([label, color]) => ({ label, color })),
	);
</script>

<TooltipContainer>
	{#snippet children({ show, move, hide })}
		<ChartFrame
			responsive
			bind:measuredWidth
			{height}
			margin={MARGIN}
			bind:innerWidth={innerW}
		>
			<GridLines
				type="horizontal"
				positions={yGridPositions}
				length={innerW}
				color="var(--chart-grid, #e2e8f0)"
				dashed
			/>
			<GridLines
				type="vertical"
				positions={xGridPositions}
				length={innerH}
				color="var(--chart-grid, #e2e8f0)"
				dashed
			/>

			{#each rows as d (d.label)}
				{@const color = bubbleColor(d)}
				<g
					transform="translate({xScale(d.x)},{yScale(d.y)})"
					style="cursor: pointer"
					role="img"
					aria-label={d.label}
					onmouseenter={(e) => show(e, tooltipFormat ? tooltipFormat(d) : defaultTooltipHtml(d))}
					onmousemove={move}
					onmouseleave={hide}
				>
					<BubbleWithLabel
						r={rScale(d.size)}
						fill={color}
						opacity={0.75}
						stroke={color}
						strokeWidth={1}
						label={d.label.substring(0, 2).toUpperCase()}
						labelFontSize={9}
					/>
				</g>
			{/each}

			<XAxis
				ticks={xTicks}
				innerHeight={innerH}
				innerWidth={innerW}
				label={xLabel}
				showLine={false}
				fontSize={10}
			/>
			<YAxis
				ticks={yTicks}
				innerHeight={innerH}
				label={yLabel}
				showLine={false}
				fontSize={10}
				labelOffset={56}
			/>

			{#if hasGroups}
				<g transform="translate({innerW - 140}, 8)">
					<Legend
						items={regionLegendItems}
						swatch="circle"
						direction="col"
						spacing={18}
						fontSize={10}
					/>
				</g>
			{/if}

			{#if sizeLabel}
				<text
					x={0}
					y={innerH + MARGIN.bottom - 6}
					font-size={10}
					fill="var(--chart-fg-muted, #555555)"
				>{sizeLabel}</text>
			{/if}
		</ChartFrame>
	{/snippet}
</TooltipContainer>
