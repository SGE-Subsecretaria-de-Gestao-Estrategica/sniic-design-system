<script lang="ts">
	import type { TreemapNode } from '../types.js';
	import type { Component } from 'svelte';
	import { treemap, hierarchy, treemapSquarify, type HierarchyRectangularNode } from 'd3';
	import { typography, type Margin } from '../tokens.js';
	import { categorical8 } from '../palettes.js';
	import { getContrastColor } from '../utils/colorContrast.js';
	import ChartFrame from './molecules/ChartFrame.svelte';
	import BarRect from './atoms/BarRect.svelte';
	import TooltipContainer from './molecules/TooltipContainer.svelte';

	interface Props {
		data?: TreemapNode;
		height?: number;
		margin?: Margin;
		colors?: readonly string[];
		format?: (v: number) => string;
		padding?: number;
		paddingOuter?: number;
		icons?: Record<string, Component>;
	}

	let {
		data = { name: 'root', children: [] },
		height = 400,
		margin = { top: 8, right: 8, bottom: 8, left: 8 },
		colors = categorical8,
		format = (v: number) => v.toLocaleString(),
		padding = 2,
		paddingOuter = 4,
		icons = {},
	}: Props = $props();

	const chartFont = typography.chartValueFontFamily;
	const MIN_LABEL_W = 36;
	const MIN_LABEL_H = 20;

	let innerW = $state(0);
	let innerH = $state(0);

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

<TooltipContainer>
	{#snippet children({ show, move, hide })}
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
						show(e, `<strong>${path}</strong><br/>${format(leaf.value ?? 0)}`);
					}}
					onmousemove={move}
					onmouseleave={hide}
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
						{@const labelColor = getContrastColor(fill)}
						{@const Icon = icons[leaf.data.name]}
						{@const iconSize = Math.min(16, h - 6)}
						{@const textX = leaf.x0 + 4 + (Icon ? iconSize + 3 : 0)}
						{#if Icon}
							<g transform="translate({leaf.x0 + 4}, {leaf.y0 + 2})">
								<Icon size={iconSize} color={labelColor} />
							</g>
						{/if}
						<text
							x={textX}
							y={leaf.y0 + 16}
							font-size={Math.min(16, w * 0.16)}
							font-weight={600}
							font-family={chartFont}
							fill={labelColor}
							pointer-events="none"
						>
							{leaf.data.name}
						</text>
						{#if h >= 36}
							<text
								x={leaf.x0 + 4}
								y={leaf.y0 + 32}
								font-size={Math.min(13, w * 0.13)}
								font-weight={400}
								font-family={chartFont}
								fill={labelColor}
								pointer-events="none"
							>
								{format(leaf.value ?? 0)}
							</text>
						{/if}
					{/if}
				</g>
			{/each}
		</ChartFrame>
	{/snippet}
</TooltipContainer>
