<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PictogramChart from '../lib/components/PictogramChart.svelte';

	const { Story } = defineMeta({
		title: 'Charts/PictogramChart',
		component: PictogramChart,
		tags: ['autodocs'],
		argTypes: {
			unitValue: { control: { type: 'number', min: 1, max: 1000 } },
			columns: { control: { type: 'range', min: 5, max: 20, step: 1 } },
			iconSize: { control: { type: 'range', min: 12, max: 32, step: 2 } },
			showLabels: { control: 'boolean' },
		},
	});
</script>

<Story
	name="Default (People)"
	args={{
		data: [
			{ label: 'Homens', value: 48 },
			{ label: 'Mulheres', value: 52 },
		],
		unitValue: 1,
		columns: 10,
		iconSize: 22,
	}}
/>

<Story
	name="Regions"
	args={{
		data: [
			{ label: 'Sudeste', value: 4500 },
			{ label: 'Nordeste', value: 2800 },
			{ label: 'Sul', value: 1900 },
			{ label: 'Norte', value: 800 },
			{ label: 'Centro-Oeste', value: 600 },
		],
		unitValue: 100,
		columns: 15,
		iconSize: 18,
	}}
/>

<Story
	name="Cultural Facilities"
	args={{
		data: [
			{ label: 'Museus', value: 35 },
			{ label: 'Bibliotecas', value: 52 },
			{ label: 'Teatros', value: 18 },
			{ label: 'Cinemas', value: 24 },
		],
		unitValue: 1,
		columns: 10,
		iconSize: 20,
	}}
/>
