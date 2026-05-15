<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PieChart from '../lib/components/PieChart.svelte';

	const { Story } = defineMeta({
		title: 'Charts/PieChart',
		component: PieChart,
		tags: ['autodocs'],
		argTypes: {
			height: { control: { type: 'range', min: 200, max: 600, step: 50 } },
			showLegend: { control: 'boolean' },
			showLabels: { control: 'boolean' },
		},
	});
</script>

<Story
	name="Default"
	args={{
		data: [
			{ label: 'Musica', value: 3200 },
			{ label: 'Cinema', value: 2100 },
			{ label: 'Teatro', value: 1400 },
			{ label: 'Danca', value: 800 },
			{ label: 'Artes Visuais', value: 600 },
		],
		height: 360,
	}}
/>

<Story
	name="Two Segments"
	args={{
		data: [
			{ label: 'Publico', value: 62 },
			{ label: 'Privado', value: 38 },
		],
		height: 320,
	}}
/>

<Story
	name="Regions"
	args={{
		data: [
			{ label: 'Norte', value: 600 },
			{ label: 'Nordeste', value: 2800 },
			{ label: 'Centro-Oeste', value: 900 },
			{ label: 'Sudeste', value: 4200 },
			{ label: 'Sul', value: 1500 },
		],
		height: 360,
	}}
/>
