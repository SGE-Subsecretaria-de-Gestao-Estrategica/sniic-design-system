<script lang="ts">
	import StateFlag from '../lib/components/atoms/icons/StateFlag.svelte';

	interface Props {
		size?: number;
	}

	let { size = 32 }: Props = $props();

	const states = [
		'BR',
		'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
		'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
		'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
	];
</script>

<div class="grid">
	{#each states as code (code)}
		<div class="flag-card">
			<StateFlag state={code} {size} />
			<span class="label">{code}</span>
		</div>
	{/each}
</div>

<style>
	.grid {
		display: flex;
		gap: 1.5rem;
		flex-wrap: wrap;
		padding: 1rem;
	}
	.flag-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		background: #fff;
		min-width: 80px;
	}
	.label {
		font-family: 'Inter', sans-serif;
		font-size: 0.8rem;
		color: #555;
		font-weight: 600;
	}
</style>
