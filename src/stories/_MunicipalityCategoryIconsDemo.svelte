<script lang="ts">
	import IconMunicipioPequenoI from '../lib/components/atoms/icons/IconMunicipioPequenoI.svelte';
	import IconMunicipioPequenoII from '../lib/components/atoms/icons/IconMunicipioPequenoII.svelte';
	import IconMunicipioMedio from '../lib/components/atoms/icons/IconMunicipioMedio.svelte';
	import IconMunicipioGrande from '../lib/components/atoms/icons/IconMunicipioGrande.svelte';

	interface Props {
		size?: number;
		color?: string;
	}

	let { size = 64, color = '#333333' }: Props = $props();
</script>

<div class="grid">
	<div class="icon-card">
		<IconMunicipioPequenoI {size} {color} />
		<span class="label">Pequeno I</span>
	</div>
	<div class="icon-card">
		<IconMunicipioPequenoII {size} {color} />
		<span class="label">Pequeno II</span>
	</div>
	<div class="icon-card">
		<IconMunicipioMedio {size} {color} />
		<span class="label">Médio</span>
	</div>
	<div class="icon-card">
		<IconMunicipioGrande {size} {color} />
		<span class="label">Grande</span>
	</div>
</div>

<style>
	.grid {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
		padding: 1rem;
	}
	.icon-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1.5rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background: #fff;
		min-width: 120px;
	}
	.label {
		font-family: 'Inter', sans-serif;
		font-size: 0.8rem;
		color: #555;
		text-align: center;
	}
</style>
