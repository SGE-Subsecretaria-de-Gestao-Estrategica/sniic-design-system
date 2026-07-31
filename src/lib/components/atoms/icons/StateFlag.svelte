<script lang="ts">
	interface Props {
		state: string;
		size?: number;
		basePath?: string;
		title?: string;
	}

	const STATE_NAMES: Record<string, string> = {
		BR: 'Brasil',
		AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas',
		BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo',
		GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul',
		MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná',
		PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
		RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina',
		SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
	};

	let {
		state,
		size = 24,
		basePath = '/flags/states',
		title,
	}: Props = $props();

	const label = $derived(title ?? `Bandeira de ${STATE_NAMES[state.toUpperCase()] ?? state}`);
	const src = $derived(`${basePath}/${state.toUpperCase()}.svg`);
	const width = $derived(size * 3 / 2);
</script>

<img
	{src}
	alt={label}
	{width}
	height={size}
	style="object-fit: contain;"
/>
