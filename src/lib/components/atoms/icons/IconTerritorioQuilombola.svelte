<script lang="ts">
	interface Props {
		size?: number;
		color?: string;
		title?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		title = 'Território quilombola',
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

	<!-- Main house with pitched roof -->
	<rect x="14" y="32" width="24" height="20" fill={color} fill-opacity="0.15" />
	<polyline points="10,32 26,16 42,32" />

	<!-- Door -->
	<rect x="23" y="40" width="6" height="12" />

	<!-- Window -->
	<rect x="17" y="36" width="4" height="4" />
	<line x1="19" y1="36" x2="19" y2="40" />

	<!-- Pilão (mortar/pestle — symbol of quilombola culture) -->
	<path d="M46,52 L48,40 L54,40 L56,52" fill={color} fill-opacity="0.15" />
	<line x1="51" y1="40" x2="51" y2="32" />
	<line x1="48" y1="34" x2="54" y2="34" />

	<!-- Palm tree -->
	<line x1="52" y1="58" x2="52" y2="18" />
	<path d="M52,18 Q44,14 40,10" fill="none" />
	<path d="M52,18 Q58,12 62,10" fill="none" />
	<path d="M52,18 Q46,20 42,18" fill="none" />
	<path d="M52,18 Q58,20 62,18" fill="none" />

	<!-- Ground -->
	<line x1="2" y1="58" x2="62" y2="58" />

	<!-- Small cultivated patch -->
	<line x1="6" y1="56" x2="6" y2="52" />
	<circle cx="6" cy="51" r="2" fill={color} fill-opacity="0.15" />
	<line x1="10" y1="56" x2="10" y2="53" />
	<circle cx="10" cy="52" r="2" fill={color} fill-opacity="0.15" />
</svg>
