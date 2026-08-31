<script lang="ts">
	/**
	 * Shared frame for the Eixo 6 charts.
	 *
	 * Handles the parts every one of them needs and none of them should
	 * re-implement: measuring the container so the chart fills whatever column
	 * the host page gives it, providing the theme, positioning the tooltip
	 * layer, and emitting the visually-hidden table that keeps every plotted
	 * value reachable without a pointer.
	 */
	import type { Snippet } from 'svelte';
	import Svg from '$lib/core/components/Svg.svelte';
	import Group from '$lib/core/components/Group.svelte';
	import Theme from '$lib/core/components/Theme.svelte';
	import ChartTooltip from '$lib/core/components/interaction/ChartTooltip.svelte';
	import type { HoverState, TooltipContent } from '$lib/core/interaction/hover.svelte.js';
	import type { ChartTheme } from '$lib/core/theme';
	import type { Margin } from '$lib/types/Chart';
	import type { LegendItem, TableView } from './types.js';

	type PlotArgs = {
		width: number;
		height: number;
		innerWidth: number;
		innerHeight: number;
		container: HTMLElement | null;
	};

	type Props = {
		theme: ChartTheme;
		/** Fixed width; omit to fill (and track) the container. */
		width?: number;
		/**
		 * Bindable — the width actually rendered at. Charts read it back to size
		 * their margins, which is why the shell cannot derive them itself.
		 */
		measuredWidth?: number;
		height: number;
		margin: Margin;
		title?: string;
		subtitle?: string;
		source?: string;
		hover: HoverState;
		/** Non-null shows the readout; the chart decides when that is. */
		tooltip?: TooltipContent | null;
		/** Overrides the pointer position, for externally driven highlights. */
		tooltipX?: number;
		tooltipY?: number;
		/**
		 * Series key. Present whenever the chart has two or more series, so
		 * identity never rests on colour alone — direct labels drop out at narrow
		 * widths, this does not.
		 */
		legend?: LegendItem[];
		/** Accessible fallback for every plotted value. Rendered off-screen. */
		table?: TableView;
		ariaLabel?: string;
		children: Snippet<[PlotArgs]>;
	};

	let {
		theme,
		width,
		measuredWidth = $bindable(0),
		height,
		margin,
		title,
		subtitle,
		source,
		hover,
		tooltip = null,
		tooltipX,
		tooltipY,
		legend,
		table,
		ariaLabel,
		children
	}: Props = $props();

	let container = $state<HTMLElement | null>(null);
	let measured = $state(0);

	let figureWidth = $derived(width ?? measured);
	let innerWidth = $derived(Math.max(0, figureWidth - margin.left - margin.right));
	let innerHeight = $derived(Math.max(0, height - margin.top - margin.bottom));

	// Nothing to lay out until the container has been measured.
	let ready = $derived(figureWidth > 0);

	$effect.pre(() => {
		measuredWidth = figureWidth;
	});
</script>

<figure class="eixo6-chart" bind:this={container} bind:clientWidth={measured}>
	{#if title}
		<figcaption class="chart-heading">
			<h3>{title}</h3>
			{#if subtitle}<p>{subtitle}</p>{/if}
		</figcaption>
	{/if}

	{#if legend?.length}
		<ul class="chart-legend">
			{#each legend as item (item.label)}
				<li>
					<span
						class="key"
						class:hatched={item.hatched}
						style:--key-color={item.color}
					></span>
					{item.label}
				</li>
			{/each}
		</ul>
	{/if}

	{#if ready}
		<Theme {theme}>
			<Svg
				width={figureWidth}
				{height}
				role="img"
				aria-label={ariaLabel ?? title}
				style="overflow: visible;"
			>
				<Group left={margin.left} top={margin.top}>
					{@render children({
						width: figureWidth,
						height,
						innerWidth,
						innerHeight,
						container
					})}
				</Group>
			</Svg>

			<ChartTooltip
				visible={!!tooltip}
				x={tooltipX ?? hover.x}
				y={tooltipY ?? hover.y}
				title={tooltip?.title}
				rows={tooltip?.rows ?? []}
				bounds={figureWidth}
			/>
		</Theme>
	{/if}

	{#if table}
		<table class="visually-hidden">
			<caption>{table.caption}</caption>
			<thead>
				<tr>
					{#each table.columns as column (column)}
						<th scope="col">{column}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each table.rows as row, i (i)}
					<tr>
						{#each row as cell, j (j)}
							{#if j === 0}
								<th scope="row">{cell}</th>
							{:else}
								<td>{cell}</td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}

	{#if source}
		<p class="chart-source">{source}</p>
	{/if}
</figure>

<style>
	.eixo6-chart {
		position: relative;
		width: 100%;
		margin: 0;
		font-family: 'General Sans Variable', system-ui, sans-serif;
	}

	.eixo6-chart :global(svg) {
		display: block;
	}

	.chart-heading {
		margin-bottom: 0.75rem;
	}

	.chart-heading h3 {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.3;
		color: #2d2e2b;
	}

	.chart-heading p {
		margin: 0.25rem 0 0;
		font-size: 0.8125rem;
		line-height: 1.4;
		color: #808679;
	}

	.chart-legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
		margin: 0 0 0.625rem;
		padding: 0;
		list-style: none;
		font-size: 0.75rem;
		color: #4d5148;
	}

	.chart-legend li {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	/* A line key, not a filled box: these are line series, and the legend
	   mirrors the mark it stands for. */
	.chart-legend .key {
		width: 0.875rem;
		height: 3px;
		border-radius: 2px;
		background: var(--key-color, currentColor);
	}

	.chart-legend .key.hatched {
		height: 0.75rem;
		border: 1px solid var(--key-color, currentColor);
		border-radius: 50%;
		background: repeating-linear-gradient(
			45deg,
			transparent 0 2px,
			var(--key-color, currentColor) 2px 3px
		);
	}

	.chart-source {
		margin: 0.75rem 0 0;
		font-size: 0.6875rem;
		color: #808679;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
