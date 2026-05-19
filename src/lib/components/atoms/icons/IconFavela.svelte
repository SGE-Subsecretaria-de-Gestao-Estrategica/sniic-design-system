<script lang="ts">
	interface Props {
		size?: number;
		color?: string;
		title?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		title = 'Favelas e comunidades urbanas',
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

	<!-- Hillside slope -->
	<line x1="4" y1="58" x2="60" y2="58" />
	<line x1="4" y1="58" x2="30" y2="20" />

	<!-- House 1 — small, upper left -->
	<rect x="18" y="36" width="10" height="10" fill={color} fill-opacity="0.15" />
	<polyline points="16,36 23,30 30,36" />
	<line x1="23" y1="42" x2="23" y2="46" />

	<!-- House 2 — taller, middle -->
	<rect x="30" y="30" width="12" height="28" fill={color} fill-opacity="0.15" />
	<rect x="33" y="34" width="3" height="4" />
	<rect x="33" y="42" width="3" height="4" />
	<rect x="33" y="50" width="3" height="4" />

	<!-- House 3 — wide, lower right -->
	<rect x="44" y="40" width="14" height="18" fill={color} fill-opacity="0.15" />
	<rect x="47" y="44" width="4" height="4" />
	<rect x="53" y="44" width="3" height="4" />
	<rect x="47" y="52" width="4" height="6" />

	<!-- Antenna / power line detail -->
	<line x1="36" y1="24" x2="36" y2="30" />
	<line x1="33" y1="26" x2="39" y2="26" />

	<!-- Power cable -->
	<path d="M16,28 Q26,22 36,26" fill="none" />
</svg>
