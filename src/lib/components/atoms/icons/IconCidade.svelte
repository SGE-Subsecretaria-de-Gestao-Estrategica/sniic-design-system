<script lang="ts">
	interface Props {
		size?: number;
		color?: string;
		title?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		title = 'Cidade',
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

	<!-- Building 1 — tall tower, left -->
	<rect x="6" y="14" width="12" height="44" fill={color} fill-opacity="0.15" />
	<rect x="9" y="18" width="3" height="4" />
	<rect x="9" y="26" width="3" height="4" />
	<rect x="9" y="34" width="3" height="4" />
	<rect x="9" y="42" width="3" height="4" />
	<rect x="9" y="50" width="3" height="4" />

	<!-- Building 2 — medium, center-left -->
	<rect x="20" y="26" width="14" height="32" fill={color} fill-opacity="0.15" />
	<rect x="23" y="30" width="3" height="4" />
	<rect x="28" y="30" width="3" height="4" />
	<rect x="23" y="38" width="3" height="4" />
	<rect x="28" y="38" width="3" height="4" />
	<rect x="23" y="46" width="3" height="4" />
	<rect x="28" y="46" width="3" height="4" />

	<!-- Building 3 — tallest, center-right -->
	<rect x="36" y="8" width="12" height="50" fill={color} fill-opacity="0.15" />
	<rect x="39" y="12" width="3" height="4" />
	<rect x="39" y="20" width="3" height="4" />
	<rect x="39" y="28" width="3" height="4" />
	<rect x="39" y="36" width="3" height="4" />
	<rect x="39" y="44" width="3" height="4" />
	<rect x="39" y="52" width="3" height="4" />

	<!-- Building 4 — short, right -->
	<rect x="50" y="38" width="10" height="20" fill={color} fill-opacity="0.15" />
	<rect x="53" y="42" width="4" height="4" />
	<rect x="53" y="50" width="4" height="4" />
</svg>
