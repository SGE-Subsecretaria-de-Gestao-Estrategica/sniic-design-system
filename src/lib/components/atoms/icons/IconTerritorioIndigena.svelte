<script lang="ts">
	interface Props {
		size?: number;
		color?: string;
		title?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		title = 'Território indígena',
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

	<!-- Oca (traditional indigenous longhouse) -->
	<path d="M8,50 Q32,10 56,50" fill={color} fill-opacity="0.15" />
	<line x1="8" y1="50" x2="56" y2="50" />

	<!-- Door opening -->
	<path d="M27,50 Q27,40 32,38 Q37,40 37,50" />

	<!-- Decorative band pattern (geometric) -->
	<line x1="14" y1="42" x2="50" y2="42" />
	<polyline points="16,42 19,38 22,42 25,38 28,42" />
	<polyline points="36,42 39,38 42,42 45,38 48,42" />

	<!-- Tree / nature element left -->
	<line x1="6" y1="58" x2="6" y2="48" />
	<circle cx="6" cy="46" r="4" fill={color} fill-opacity="0.15" />

	<!-- Tree / nature element right -->
	<line x1="58" y1="58" x2="58" y2="46" />
	<circle cx="58" cy="44" r="4" fill={color} fill-opacity="0.15" />

	<!-- Ground -->
	<line x1="2" y1="58" x2="62" y2="58" />
</svg>
