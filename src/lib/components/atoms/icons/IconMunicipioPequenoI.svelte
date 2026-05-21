<script lang="ts">
	interface Props {
		size?: number;
		color?: string;
		title?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		title = 'Município Pequeno I',
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

	<!-- Tree -->
	<line x1="7" y1="52" x2="7" y2="58" />
	<circle cx="7" cy="47" r="6" fill={color} fill-opacity="0.15" />

	<!-- House body -->
	<rect x="16" y="38" width="32" height="20" fill={color} fill-opacity="0.15" />

	<!-- Roof -->
	<polyline points="12,38 32,20 52,38" />

	<!-- Door -->
	<rect x="27" y="48" width="10" height="10" />

	<!-- Windows -->
	<rect x="18" y="42" width="7" height="6" />
	<rect x="39" y="42" width="7" height="6" />
</svg>
