<script lang="ts">
	/**
	 * Hover readout for a chart. Positioned inside the chart container, so the
	 * container must be `position: relative`.
	 *
	 * Values lead and labels follow — the reader already knows the series and
	 * wants the number. Series are keyed with a short stroke rather than a
	 * filled box: at this density a box is data-weight ink doing a label's job.
	 *
	 * Labels come from data files, so they are rendered as text nodes. Never
	 * add `{@html}` here.
	 */
	import type { TooltipRow } from '$lib/core/interaction/hover.svelte.js';
	import { DefaultTheme, getChartTheme } from '$lib/core/theme';

	type Props = {
		visible?: boolean;
		/** Container-relative pointer position. */
		x?: number;
		y?: number;
		title?: string;
		rows?: TooltipRow[];
		/** Container width, used to flip the tooltip before it clips. */
		bounds?: number;
		offsetX?: number;
		offsetY?: number;
	};

	let {
		visible = false,
		x = 0,
		y = 0,
		title,
		rows = [],
		bounds = Infinity,
		offsetX = 14,
		offsetY = 12
	}: Props = $props();

	const theme = getChartTheme();
	const palette = $derived(theme?.palette ?? DefaultTheme.palette);

	const WIDTH_ESTIMATE = 200;

	/** Flip to the pointer's left when the default side would overflow. */
	let flipped = $derived(x + offsetX + WIDTH_ESTIMATE > bounds);
	let left = $derived(flipped ? x - offsetX : x + offsetX);
</script>

{#if visible && rows.length > 0}
	<div
		class="tooltip"
		class:flipped
		style:left="{left}px"
		style:top="{y + offsetY}px"
		style:--surface={palette.base?.[100]}
		style:--border={palette.base?.[300]}
		style:--ink={palette.neutral?.[400]}
		style:--muted={palette.neutral?.[100]}
		role="tooltip"
		aria-hidden="true"
	>
		{#if title}
			<p class="tooltip-title">{title}</p>
		{/if}
		<ul class="tooltip-rows">
			{#each rows as row (row.label)}
				<li class="tooltip-row" class:emphasis={row.emphasis}>
					<span class="key" style:background={row.color ?? 'transparent'}></span>
					<span class="value">{row.value}</span>
					<span class="label">{row.label}</span>
				</li>
			{/each}
		</ul>
	</div>
{/if}

<style>
	.tooltip {
		position: absolute;
		z-index: 20;
		pointer-events: none;
		min-width: 8.5rem;
		max-width: 14rem;
		padding: 0.5rem 0.625rem;
		border: 1px solid var(--border, #eceeed);
		border-radius: 6px;
		background: var(--surface, #feffFC);
		color: var(--ink, #1c1c1c);
		font-family: 'General Sans Variable', system-ui, sans-serif;
		font-size: 0.75rem;
		line-height: 1.35;
		box-shadow: 0 6px 20px rgb(0 0 0 / 0.12);
	}

	.tooltip.flipped {
		transform: translateX(-100%);
	}

	.tooltip-title {
		margin: 0 0 0.375rem;
		color: var(--muted, #808679);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.tooltip-rows {
		display: grid;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.tooltip-row {
		display: grid;
		grid-template-columns: 0.75rem auto;
		grid-template-areas: 'key value' '. label';
		align-items: baseline;
		column-gap: 0.375rem;
	}

	.key {
		grid-area: key;
		align-self: center;
		width: 0.75rem;
		height: 2px;
		border-radius: 1px;
	}

	.value {
		grid-area: value;
		font-size: 0.875rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.label {
		grid-area: label;
		color: var(--muted, #808679);
	}

	.tooltip-row.emphasis .value {
		font-size: 1rem;
	}
</style>
