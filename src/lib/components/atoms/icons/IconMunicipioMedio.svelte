<script lang="ts">
	interface Props {
		size?: number;
		color?: string;
		title?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		title = 'Município Médio',
	}: Props = $props();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	viewBox="0 0 64 64"
	fill="none"
	stroke={color}
	stroke-width="2.5"
	stroke-linecap="round"
	stroke-linejoin="round"
	role="img"
	aria-label={title}
>
	{#if title}<title>{title}</title>{/if}

	<!-- Ground line -->
	<line x1="4" y1="58" x2="60" y2="58" />

	<!-- Building 1 — left, medium -->
	<rect x="4" y="34" width="14" height="24" fill={color} fill-opacity="0.15" />
	<rect x="7" y="37" width="4" height="4" />
	<rect x="7" y="45" width="4" height="4" />
	<rect x="7" y="53" width="4" height="4" />

	<!-- Building 2 — center, tallest -->
	<rect x="22" y="24" width="18" height="34" fill={color} fill-opacity="0.15" />
	<rect x="25" y="28" width="5" height="4" />
	<rect x="33" y="28" width="5" height="4" />
	<rect x="25" y="36" width="5" height="4" />
	<rect x="33" y="36" width="5" height="4" />
	<rect x="25" y="44" width="5" height="4" />
	<rect x="33" y="44" width="5" height="4" />

	<!-- Building 3 — right, medium -->
	<rect x="44" y="34" width="14" height="24" fill={color} fill-opacity="0.15" />
	<rect x="47" y="37" width="4" height="4" />
	<rect x="47" y="45" width="4" height="4" />
	<rect x="47" y="53" width="4" height="4" />
</svg>
