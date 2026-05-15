<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WaffleChart from '../lib/components/WaffleChart.svelte';

	const { Story } = defineMeta({
		title: 'Charts/WaffleChart',
		component: WaffleChart,
		tags: ['autodocs'],
		argTypes: {
			height: { control: { type: 'range', min: 200, max: 600, step: 50 } },
			totalCells: { control: { type: 'range', min: 25, max: 200, step: 25 } },
			columns: { control: { type: 'range', min: 5, max: 20, step: 1 } },
			cellGap: { control: { type: 'range', min: 0, max: 8, step: 1 } },
			showLegend: { control: 'boolean' },
		},
	});
</script>

<Story
	name="Default"
	args={{
		data: [
			{ label: 'Musica', value: 32 },
			{ label: 'Cinema', value: 21 },
			{ label: 'Teatro', value: 14 },
			{ label: 'Danca', value: 8 },
			{ label: 'Artes Visuais', value: 6 },
			{ label: 'Outros', value: 19 },
		],
		totalCells: 100,
		columns: 10,
		height: 360,
	}}
/>

<Story
	name="Two Categories"
	args={{
		data: [
			{ label: 'Publico', value: 62 },
			{ label: 'Privado', value: 38 },
		],
		totalCells: 100,
		columns: 10,
		height: 360,
	}}
/>

<Story
	name="Regions"
	args={{
		data: [
			{ label: 'Norte', value: 6 },
			{ label: 'Nordeste', value: 28 },
			{ label: 'Centro-Oeste', value: 9 },
			{ label: 'Sudeste', value: 42 },
			{ label: 'Sul', value: 15 },
		],
		totalCells: 100,
		columns: 10,
		height: 360,
	}}
/>
