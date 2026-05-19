<script lang="ts" module>
	export interface TreemapNode {
		name: string;
		value?: number;
		children?: TreemapNode[];
	}
</script>

<script lang="ts">
	import { treemap, hierarchy, treemapSquarify, type HierarchyRectangularNode } from 'd3';
	import { black, typography, type Margin } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { getContrastColor } from '../utils/colorContrast.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import BarRect from './atoms/BarRect.svelte';
	import Tooltip from './molecules/Tooltip.svelte';
	import { relativePos } from '../utils/tooltipState.js';

	interface Props {
		data?: TreemapNode;
		height?: number;
		margin?: Margin;
		colors?: readonly string[];
		format?: (v: number) => string;
		/** Padding between cells in pixels. */
		padding?: number;
		/** Padding around parent groups. */
		paddingOuter?: number;
	}

	let {
		data = { name: 'root', children: [] },
		height = 400,
		margin = { top: 8, right: 8, bottom: 8, left: 8 },
		colors = categorical8,
		format = (v: number) => v.toLocaleString(),
		padding = 2,
		paddingOuter = 4,
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;
	const STROKE_W = 0.5;
	const MIN_LABEL_W = 36;
	const MIN_LABEL_H = 18;

	let wrapperEl: HTMLDivElement | undefined = $state();
	let innerW = $state(0);
	let innerH = $state(0);
	let tooltip = $state({ visible: false, x: 0, y: 0, html: '' });

	const root = $derived(
		hierarchy(data)
			.sum((d) => d.value ?? 0)
			.sort((a, b) => (b.value ?? 0) - (a.value ?? 0)),
	);

	const layout = $derived(
		treemap<TreemapNode>()
			.size([innerW, innerH])
			.padding(padding)
			.paddingOuter(paddingOuter)
			.tile(treemapSquarify),
	);

	const leaves = $derived.by(() => {
		if (innerW <= 0 || innerH <= 0) return [];
		const layoutRoot = layout(root);
		return layoutRoot.leaves();
	});

	/** Map top-level parent names to colors. */
	const topLevelNames = $derived(
		(data.children ?? []).map((c) => c.name),
	);

	function nodeColor(node: HierarchyRectangularNode<TreemapNode>): string {
		const topAncestor = node.ancestors().find((a) => a.depth === 1);
		if (!topAncestor) return colors[0];
		const idx = topLevelNames.indexOf(topAncestor.data.name);
		return colors[idx >= 0 ? idx % colors.length : 0];
	}
</script>

<div bind:this={wrapperEl} class="treemap-wrapper">
	<ChartFrame responsive {height} {margin} bind:innerWidth={innerW} bind:innerHeight={innerH} ariaLabel="Treemap chart">
		{#each leaves as leaf (leaf.data.name + '-' + leaf.x0 + '-' + leaf.y0)}
			{@const w = leaf.x1 - leaf.x0}
			{@const h = leaf.y1 - leaf.y0}
			{@const fill = nodeColor(leaf)}
			<g
				role="img"
				aria-label={leaf.data.name}
				onmouseenter={(e) => {
					const path = leaf
						.ancestors()
						.reverse()
						.slice(1)
						.map((a) => a.data.name)
						.join(' > ');
					const html = `<strong>${path}</strong><br/>${format(leaf.value ?? 0)}`;
					tooltip = { visible: true, ...relativePos(e, wrapperEl!), html };
				}}
				onmousemove={(e) => {
					tooltip = { ...tooltip, ...relativePos(e, wrapperEl!) };
				}}
				onmouseleave={() => {
					tooltip = { ...tooltip, visible: false };
				}}
			>
				<BarRect
					x={leaf.x0}
					y={leaf.y0}
					width={w}
					height={h}
					{fill}
					stroke="none"
					strokeWidth={0}
					shapeRendering="crispEdges"
				/>
				{#if w >= MIN_LABEL_W && h >= MIN_LABEL_H}
					<text
						x={leaf.x0 + 4}
						y={leaf.y0 + 14}
						font-size={Math.min(12, w * 0.12)}
						font-weight={600}
						font-family={chartFont}
						fill={getContrastColor(fill)}
						pointer-events="none"
					>
						{leaf.data.name}
					</text>
					{#if h >= 32}
						<text
							x={leaf.x0 + 4}
							y={leaf.y0 + 28}
							font-size={Math.min(10, w * 0.1)}
							font-weight={400}
							font-family={chartFont}
							fill={getContrastColor(fill)}
							pointer-events="none"
						>
							{format(leaf.value ?? 0)}
						</text>
					{/if}
				{/if}
			</g>
		{/each}
	</ChartFrame>

	<Tooltip {...tooltip} offsetX={12} offsetY={-28} />
</div>

<style>
	.treemap-wrapper {
		position: relative;
		width: 100%;
	}
</style>
