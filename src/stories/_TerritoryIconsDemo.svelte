<script lang="ts">
	import IconFavela from '../lib/components/atoms/icons/IconFavela.svelte';
	import IconTerritorioIndigena from '../lib/components/atoms/icons/IconTerritorioIndigena.svelte';
	import IconTerritorioQuilombola from '../lib/components/atoms/icons/IconTerritorioQuilombola.svelte';
	import IconRural from '../lib/components/atoms/icons/IconRural.svelte';

	interface Props {
		size?: number;
		color?: string;
	}

	let { size = 64, color = '#333333' }: Props = $props();
</script>

<div class="grid">
	<div class="icon-card">
		<IconFavela {size} {color} />
		<span class="label">Favelas e comunidades urbanas</span>
	</div>
	<div class="icon-card">
		<IconTerritorioIndigena {size} {color} />
		<span class="label">Território indígena</span>
	</div>
	<div class="icon-card">
		<IconTerritorioQuilombola {size} {color} />
		<span class="label">Território quilombola</span>
	</div>
	<div class="icon-card">
		<IconRural {size} {color} />
		<span class="label">Área rural</span>
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
		min-width: 160px;
	}
	.label {
		font-family: 'Inter', sans-serif;
		font-size: 0.8rem;
		color: #555;
		text-align: center;
	}
</style>
