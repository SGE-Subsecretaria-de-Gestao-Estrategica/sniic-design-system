<script lang="ts">
	interface Props {
		x: number;
		y: number;
		width: number;
		height: number;
		fill?: string;
		rx?: number;
		opacity?: number;
		stroke?: string;
		strokeWidth?: number;
		shapeRendering?: string;
		title?: string;
	}

	let {
		x,
		y,
		width,
		height,
		fill = '#4271b5',
		rx = 0,
		opacity,
		stroke,
		strokeWidth,
		shapeRendering,
		title,
	}: Props = $props();
</script>

<rect
	{x}
	{y}
	width={Math.max(0, width)}
	height={Math.max(0, height)}
	{fill}
	{rx}
	opacity={opacity}
	stroke={stroke}
	stroke-width={strokeWidth}
	shape-rendering={shapeRendering}
>
	{#if title}
		<title>{title}</title>
	{/if}
</rect>
