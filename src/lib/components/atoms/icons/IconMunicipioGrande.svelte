<script lang="ts">
	interface Props {
		size?: number;
		color?: string;
		title?: string;
	}

	let {
		size = 24,
		color = 'currentColor',
		title = 'Município Grande',
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

	<!-- Building 1 — far left, tall -->
	<rect x="2" y="20" width="12" height="38" fill={color} fill-opacity="0.15" />
	<rect x="5" y="23" width="3" height="3" />
	<rect x="5" y="30" width="3" height="3" />
	<rect x="5" y="37" width="3" height="3" />
	<rect x="5" y="44" width="3" height="3" />
	<rect x="5" y="51" width="3" height="3" />

	<!-- Building 2 — center-left, tallest -->
	<rect x="17" y="10" width="14" height="48" fill={color} fill-opacity="0.15" />
	<rect x="20" y="13" width="3" height="3" />
	<rect x="26" y="13" width="3" height="3" />
	<rect x="20" y="20" width="3" height="3" />
	<rect x="26" y="20" width="3" height="3" />
	<rect x="20" y="27" width="3" height="3" />
	<rect x="26" y="27" width="3" height="3" />
	<rect x="20" y="34" width="3" height="3" />
	<rect x="26" y="34" width="3" height="3" />
	<rect x="20" y="41" width="3" height="3" />
	<rect x="26" y="41" width="3" height="3" />
	<rect x="20" y="48" width="3" height="3" />
	<rect x="26" y="48" width="3" height="3" />

	<!-- Building 3 — center-right, tall -->
	<rect x="34" y="16" width="14" height="42" fill={color} fill-opacity="0.15" />
	<rect x="37" y="19" width="3" height="3" />
	<rect x="43" y="19" width="3" height="3" />
	<rect x="37" y="26" width="3" height="3" />
	<rect x="43" y="26" width="3" height="3" />
	<rect x="37" y="33" width="3" height="3" />
	<rect x="43" y="33" width="3" height="3" />
	<rect x="37" y="40" width="3" height="3" />
	<rect x="43" y="40" width="3" height="3" />
	<rect x="37" y="47" width="3" height="3" />
	<rect x="43" y="47" width="3" height="3" />

	<!-- Building 4 — far right, medium-tall -->
	<rect x="51" y="28" width="12" height="30" fill={color} fill-opacity="0.15" />
	<rect x="54" y="31" width="3" height="3" />
	<rect x="54" y="38" width="3" height="3" />
	<rect x="54" y="45" width="3" height="3" />
	<rect x="54" y="52" width="3" height="3" />
</svg>
