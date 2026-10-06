<script lang="ts">
	/** Vertical hairline marking the hovered x position. Recessive by design. */
	import { DefaultTheme, getChartTheme } from '$lib/core/theme';

	type Props = {
		x: number;
		height: number;
		top?: number;
		visible?: boolean;
		stroke?: string;
		strokeWidth?: number;
		strokeDasharray?: string;
	};

	let {
		x,
		height,
		top = 0,
		visible = true,
		stroke,
		strokeWidth = 1,
		strokeDasharray = '3 3'
	}: Props = $props();

	const theme = getChartTheme();

	let color = $derived(
		stroke ?? theme?.palette?.neutral?.[100] ?? DefaultTheme.palette.neutral[100]
	);
</script>

<line
	x1={x}
	x2={x}
	y1={top}
	y2={top + height}
	stroke={color}
	stroke-width={strokeWidth}
	stroke-dasharray={strokeDasharray}
	pointer-events="none"
	class="crosshair"
	class:visible
/>

<style>
	.crosshair {
		opacity: 0;
		transition: opacity 120ms ease-out;
	}

	.crosshair.visible {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.crosshair {
			transition: none;
		}
	}
</style>
