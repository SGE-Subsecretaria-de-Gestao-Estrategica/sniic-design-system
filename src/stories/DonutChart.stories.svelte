<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DonutChart from '../lib/components/DonutChart.svelte';

	const { Story } = defineMeta({
		title: 'Charts/DonutChart',
		component: DonutChart,
		tags: ['autodocs'],
		argTypes: {
			height: { control: { type: 'range', min: 200, max: 600, step: 50 } },
			innerRadiusFraction: { control: { type: 'range', min: 0, max: 0.85, step: 0.05 } },
			showLegend: { control: 'boolean' },
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
		centerValue: '8.1k',
		centerLabel: 'Total',
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
		centerValue: '62%',
		centerLabel: 'Publico',
	}}
/>

<Story
	name="Pie (no hole)"
	args={{
		data: [
			{ label: 'Norte', value: 600 },
			{ label: 'Nordeste', value: 2800 },
			{ label: 'Centro-Oeste', value: 900 },
			{ label: 'Sudeste', value: 4200 },
			{ label: 'Sul', value: 1500 },
		],
		height: 360,
		innerRadiusFraction: 0,
	}}
/>
