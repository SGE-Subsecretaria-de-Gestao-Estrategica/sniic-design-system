<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { defaultMargin, typography, type Margin } from '../../tokens.js';

	interface Props {
		width?: number;
		height?: number;
		margin?: Margin;
		/**
		 * When true, tracks the container width via ResizeObserver
		 * and uses it as the SVG width. The height prop is always honoured directly.
		 */
		responsive?: boolean;
		role?: string;
		ariaLabel?: string;
		fontFamily?: string;
		/** Bindable — the resolved SVG width (container width when responsive). */
		measuredWidth?: number;
		/** Bindable — width minus horizontal margins. */
		innerWidth?: number;
		/** Bindable — height minus vertical margins. */
		innerHeight?: number;
		/** Bindable — the underlying SVGSVGElement. */
		svgEl?: SVGSVGElement | undefined;
		children?: Snippet;
	}

	let {
		width = 600,
		height = 400,
		margin = defaultMargin,
		responsive = false,
		role = 'img',
		ariaLabel = 'Chart',
		fontFamily = typography.chartValueFontFamily,
		measuredWidth = $bindable(0),
		innerWidth = $bindable(0),
		innerHeight = $bindable(0),
		svgEl = $bindable<SVGSVGElement | undefined>(undefined),
		children,
	}: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	let localSvgEl: SVGSVGElement | undefined = $state();
	let containerWidth = $state(0);

	const svgWidth = $derived(responsive ? containerWidth : width);
	const ready = $derived(!responsive || containerWidth > 0);

	$effect.pre(() => {
		measuredWidth = svgWidth;
		innerWidth = svgWidth - margin.left - margin.right;
		innerHeight = height - margin.top - margin.bottom;
		svgEl = localSvgEl;
	});

	onMount(() => {
		if (!responsive || !containerEl) return;
		containerWidth = containerEl.clientWidth || 0;
		const ro = new ResizeObserver(([entry]) => {
			containerWidth = entry.contentRect.width;
		});
		ro.observe(containerEl);
		return () => ro.disconnect();
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div bind:this={containerEl} class="chart-frame">
	{#if ready}
		<svg
			bind:this={localSvgEl}
			width={svgWidth}
			{height}
			{role}
			aria-label={ariaLabel}
			font-family={fontFamily}
			style="overflow: visible;"
		>
			<g transform="translate({margin.left},{margin.top})">
				{@render children?.()}
			</g>
		</svg>
	{/if}
</div>

<style>
	.chart-frame {
		width: 100%;
	}
	svg {
		display: block;
		width: 100%;
	}
</style>
