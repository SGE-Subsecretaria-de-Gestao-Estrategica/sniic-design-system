<script lang="ts">
	interface Props {
		size?: number;
		color?: string;
		title?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		title = 'Interior',
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

	<!-- Church — central landmark -->
	<rect x="22" y="32" width="16" height="26" fill={color} fill-opacity="0.15" />
	<polyline points="20,32 30,20 40,32" />
	<line x1="30" y1="14" x2="30" y2="20" />
	<line x1="28" y1="17" x2="32" y2="17" />
	<rect x="27" y="48" width="6" height="10" />
	<circle cx="30" cy="39" r="3" />

	<!-- House — left -->
	<rect x="4" y="44" width="14" height="14" fill={color} fill-opacity="0.15" />
	<polyline points="2,44 11,36 20,44" />
	<rect x="8" y="50" width="5" height="8" />

	<!-- House — right -->
	<rect x="44" y="44" width="14" height="14" fill={color} fill-opacity="0.15" />
	<polyline points="42,44 51,36 60,44" />
	<rect x="48" y="50" width="5" height="8" />

	<!-- Tree — far left -->
	<line x1="4" y1="50" x2="4" y2="58" />
	<circle cx="4" cy="46" r="4" fill={color} fill-opacity="0.15" />

	<!-- Tree — far right -->
	<line x1="60" y1="50" x2="60" y2="58" />
	<circle cx="60" cy="46" r="4" fill={color} fill-opacity="0.15" />
</svg>
