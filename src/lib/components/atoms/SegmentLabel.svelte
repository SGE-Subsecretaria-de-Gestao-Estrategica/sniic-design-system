<script lang="ts">
	import { typography } from '../../tokens.js';
	import { getContrastColor } from '../../utils/colorContrast.js';
	import { segmentLabelFontSize, labelFitsInBar } from '../../utils/labelHelpers.js';

	interface Props {
		text: string;
		x: number;
		y: number;
		/** Width available for the label text (used for fit check). */
		availableWidth: number;
		/** Height of the containing band/segment (used for font size scaling). */
		bandHeight: number;
		/** Background color of the segment (used for contrast text color). */
		fill: string;
		textAnchor?: 'start' | 'middle' | 'end';
		padding?: number;
		rightMargin?: number;
		fontFamily?: string;
	}

	let {
		text,
		x,
		y,
		availableWidth,
		bandHeight,
		fill,
		textAnchor = 'start',
		padding = 6,
		rightMargin = 4,
		fontFamily = typography.chartValueFontFamily,
	}: Props = $props();

	const fontSize = $derived(segmentLabelFontSize(bandHeight));
	const fits = $derived(labelFitsInBar(text, fontSize, availableWidth, padding, rightMargin));
</script>

{#if fits}
	<text
		{x}
		{y}
		dy="0.35em"
		text-anchor={textAnchor}
		font-size={fontSize}
		font-weight={700}
		font-family={fontFamily}
		fill={getContrastColor(fill)}
		pointer-events="none"
	>{text}</text>
{/if}
