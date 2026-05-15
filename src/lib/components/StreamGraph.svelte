<script lang="ts" module>
	export interface StreamDatum {
		[key: string]: string | number;
	}
</script>

<script lang="ts">
	import {
		scaleLinear,
		scalePoint,
		stack,
		stackOffsetWiggle,
		stackOrderInsideOut,
		area,
		curveMonotoneX,
	} from 'd3';
	import { typography, type Margin } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { buildColorMap, buildLegendItems } from '../utils/colorMapHelpers.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import XAxis from './atoms/XAxis.svelte';
	import Legend from './atoms/Legend.svelte';
	import Tooltip from './molecules/Tooltip.svelte';
	import { relativePos } from '../utils/tooltipState.js';

	interface Props {
		data?: StreamDatum[];
		keys?: string[];
		categoryKey?: string;
		labels?: Record<string, string>;
		height?: number;
		margin?: Margin;
		colors?: readonly string[];
		format?: (v: number) => string;
	}

	let {
		data = [],
		keys = [],
		categoryKey = 'label',
		labels = {},
		height = 400,
		margin = { top: 32, right: 20, bottom: 40, left: 20 },
		colors = categorical8,
		format = (v: number) => v.toLocaleString(),
	}: Props = $props();

	let wrapperEl: HTMLDivElement | undefined = $state();
	let innerW = $state(0);
	let innerH = $state(0);
	let tooltip = $state({ visible: false, x: 0, y: 0, html: '' });

	const effectiveKeys = $derived(
		keys.length > 0
			? keys
			: data.length > 0
				? Object.keys(data[0]).filter(
						(k) => k !== categoryKey && typeof data[0][k] === 'number',
					)
				: [],
	);

	const colorMap = $derived(buildColorMap(effectiveKeys, colors));
	const legendItems = $derived(buildLegendItems(effectiveKeys, colorMap, labels));

	const categories = $derived(data.map((d) => String(d[categoryKey])));

	const xScale = $derived(
		scalePoint<string>().domain(categories).range([0, innerW]).padding(0),
	);

	const stackLayout = $derived(
		stack<StreamDatum>()
			.keys(effectiveKeys)
			.offset(stackOffsetWiggle)
			.order(stackOrderInsideOut)(data),
	);

	const yExtent = $derived.by(() => {
		let min = Infinity;
		let max = -Infinity;
		for (const layer of stackLayout) {
			for (const d of layer) {
				if (d[0] < min) min = d[0];
				if (d[1] > max) max = d[1];
			}
		}
		return [min, max] as [number, number];
	});

	const yScale = $derived(
		scaleLinear()
			.domain(yExtent)
			.range([innerH, 0]),
	);

	const areaGen = $derived(
		area<[number, number]>()
			.x((_, i) => xScale(categories[i]) ?? 0)
			.y0((d) => yScale(d[0]))
			.y1((d) => yScale(d[1]))
			.curve(curveMonotoneX),
	);

	const xTicks = $derived(
		categories
			.filter((_, i) => i % Math.max(1, Math.floor(categories.length / 8)) === 0)
			.map((c) => ({ value: c, x: xScale(c) ?? 0 })),
	);
</script>

<div bind:this={wrapperEl} class="stream-wrapper">
	<ChartFrame responsive {height} {margin} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Stream graph">
		{#each stackLayout as layer (layer.key)}
			{@const fill = colorMap[layer.key] ?? '#999'}
			<path
				d={areaGen(layer as unknown as [number, number][]) ?? ''}
				{fill}
				opacity={0.85}
				stroke={fill}
				stroke-width={0.5}
				role="img"
				aria-label={labels[layer.key] ?? layer.key}
				onmouseenter={(e) => {
					const total = data.reduce((s, d) => s + (Number(d[layer.key]) || 0), 0);
					const html = `<strong>${labels[layer.key] ?? layer.key}</strong><br/>Total: ${format(total)}`;
					tooltip = { visible: true, ...relativePos(e, wrapperEl!), html };
				}}
				onmousemove={(e) => {
					tooltip = { ...tooltip, ...relativePos(e, wrapperEl!) };
				}}
				onmouseleave={() => {
					tooltip = { ...tooltip, visible: false };
				}}
			/>
		{/each}

		<XAxis
			ticks={xTicks}
			innerHeight={innerH}
			innerWidth={innerW}
			showLine={false}
			color="#555555"
			fontSize={10}
			fontFamily={typography.chartValueFontFamily}
		/>

		<g transform="translate(0, {-margin.top + 4})">
			<Legend items={legendItems} spacing={100} />
		</g>
	</ChartFrame>

	<Tooltip {...tooltip} offsetX={12} offsetY={-28} />
</div>

<style>
	.stream-wrapper {
		position: relative;
		width: 100%;
	}
</style>
