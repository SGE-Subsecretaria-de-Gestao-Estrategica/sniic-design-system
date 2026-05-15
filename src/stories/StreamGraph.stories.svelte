<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StreamGraph from '../lib/components/StreamGraph.svelte';

	const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];

	const { Story } = defineMeta({
		title: 'Charts/StreamGraph',
		component: StreamGraph,
		tags: ['autodocs'],
		argTypes: {
			height: { control: { type: 'range', min: 200, max: 600, step: 50 } },
		},
	});
</script>

<Story
	name="Default"
	args={{
		data: years.map((label, i) => ({
			label,
			Music: [30, 42, 55, 48, 60, 72, 85][i],
			Film: [20, 25, 35, 45, 40, 38, 50][i],
			Theater: [15, 18, 12, 20, 25, 22, 28][i],
			Dance: [10, 12, 8, 15, 18, 20, 24][i],
		})),
		keys: ['Music', 'Film', 'Theater', 'Dance'],
		height: 400,
	}}
/>

<Story
	name="Many Series"
	args={{
		data: years.map((label, i) => ({
			label,
			Norte: [12, 15, 18, 14, 20, 22, 25][i],
			Nordeste: [30, 35, 28, 40, 45, 42, 50][i],
			'Centro-Oeste': [8, 10, 12, 15, 14, 16, 18][i],
			Sudeste: [50, 55, 60, 65, 58, 70, 75][i],
			Sul: [20, 22, 25, 28, 30, 32, 35][i],
		})),
		keys: ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'],
		labels: {
			Norte: 'Norte',
			Nordeste: 'Nordeste',
			'Centro-Oeste': 'Centro-Oeste',
			Sudeste: 'Sudeste',
			Sul: 'Sul',
		},
		height: 450,
	}}
/>
