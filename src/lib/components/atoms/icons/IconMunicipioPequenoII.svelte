<script lang="ts">
	interface Props {
		size?: number;
		color?: string;
		title?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		title = 'Município Pequeno II',
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

	<!-- House 1 — left, smaller -->
	<rect x="2" y="44" width="22" height="14" fill={color} fill-opacity="0.15" />
	<polyline points="0,44 13,32 26,44" />
	<rect x="9" y="52" width="6" height="6" />
	<rect x="3" y="47" width="5" height="4" />

	<!-- House 2 — right, slightly larger -->
	<rect x="34" y="40" width="26" height="18" fill={color} fill-opacity="0.15" />
	<polyline points="30,40 47,24 64,40" />
	<rect x="44" y="48" width="8" height="10" />
	<rect x="36" y="43" width="6" height="5" />
	<rect x="52" y="43" width="6" height="5" />
</svg>
