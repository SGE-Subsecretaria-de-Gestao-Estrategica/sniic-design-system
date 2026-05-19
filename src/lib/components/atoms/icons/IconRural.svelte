<script lang="ts">
	interface Props {
		size?: number;
		color?: string;
		title?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		title = 'Área rural',
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

	<!-- House — small farmhouse -->
	<rect x="6" y="40" width="18" height="18" fill={color} fill-opacity="0.15" />
	<polyline points="4,40 15,30 26,40" />
	<rect x="12" y="48" width="6" height="10" />

	<!-- Silo / barn tower -->
	<rect x="26" y="34" width="8" height="24" fill={color} fill-opacity="0.15" />
	<line x1="26" y1="42" x2="34" y2="42" />
	<ellipse cx="30" cy="34" rx="4" ry="2" />

	<!-- Tree -->
	<line x1="46" y1="42" x2="46" y2="58" />
	<circle cx="46" cy="36" r="8" fill={color} fill-opacity="0.15" />

	<!-- Fence -->
	<line x1="36" y1="52" x2="60" y2="52" />
	<line x1="38" y1="48" x2="38" y2="58" />
	<line x1="54" y1="48" x2="54" y2="58" />

	<!-- Field rows -->
	<line x1="4" y1="62" x2="24" y2="62" />
	<line x1="6" y1="66" x2="22" y2="66" />
</svg>
