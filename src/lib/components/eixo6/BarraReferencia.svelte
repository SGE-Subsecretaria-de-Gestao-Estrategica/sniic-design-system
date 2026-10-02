<script lang="ts">
	/**
	 * One bar of the hexagonal map: the value in its own colour up to the
	 * reference, and whatever passes the reference in the excess colour, so the
	 * amount above the line reads as a mark of its own.
	 *
	 * Only the outer corners are rounded — the two parts meet flush at the line.
	 */
	type Props = {
		x: number;
		/** Where the bar stands (its bottom), in px. */
		base: number;
		width: number;
		/** Bar length in px. */
		height: number;
		/** The reference line's y, in px; `null` draws the bar in one colour. */
		refY?: number | null;
		fill: string;
		excessFill: string;
		radius?: number;
	};

	let { x, base, width, height, refY = null, fill, excessFill, radius = 2 }: Props = $props();

	/** A rect path with separate radii for its top and bottom corners. */
	function rect(y: number, h: number, rTop: number, rBottom: number) {
		const rt = Math.min(rTop, h / 2, width / 2);
		const rb = Math.min(rBottom, h / 2, width / 2);
		const x1 = x + width;
		const y1 = y + h;
		return (
			`M${x},${y + rt}` +
			(rt ? `Q${x},${y} ${x + rt},${y}` : '') +
			`L${x1 - rt},${y}` +
			(rt ? `Q${x1},${y} ${x1},${y + rt}` : '') +
			`L${x1},${y1 - rb}` +
			(rb ? `Q${x1},${y1} ${x1 - rb},${y1}` : '') +
			`L${x + rb},${y1}` +
			(rb ? `Q${x},${y1} ${x},${y1 - rb}` : '') +
			'Z'
		);
	}

	let h = $derived(Math.max(0, height));
	let top = $derived(base - h);
	let split = $derived(refY !== null && top < refY ? Math.max(top, Math.min(base, refY)) : base);
</script>

{#if h > 0}
	{#if split < base}
		<path d={rect(split, base - split, split > top ? 0 : radius, radius)} {fill} />
	{/if}
	{#if split > top}
		<path d={rect(top, split - top, radius, split < base ? 0 : radius)} fill={split < base ? excessFill : fill} />
	{/if}
{/if}
