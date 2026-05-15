<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TreemapChart from '../lib/components/TreemapChart.svelte';

	const { Story } = defineMeta({
		title: 'Charts/TreemapChart',
		component: TreemapChart,
		tags: ['autodocs'],
		argTypes: {
			height: { control: { type: 'range', min: 200, max: 600, step: 50 } },
			padding: { control: { type: 'range', min: 0, max: 8, step: 1 } },
			paddingOuter: { control: { type: 'range', min: 0, max: 12, step: 1 } },
		},
	});
</script>

<Story
	name="Default"
	args={{
		data: {
			name: 'Cultura',
			children: [
				{
					name: 'Musica',
					children: [
						{ name: 'Sertanejo', value: 3200 },
						{ name: 'MPB', value: 2400 },
						{ name: 'Rock', value: 1800 },
						{ name: 'Funk', value: 1500 },
						{ name: 'Forró', value: 900 },
					],
				},
				{
					name: 'Cinema',
					children: [
						{ name: 'Drama', value: 2100 },
						{ name: 'Comedia', value: 1600 },
						{ name: 'Documentario', value: 800 },
						{ name: 'Animação', value: 500 },
					],
				},
				{
					name: 'Teatro',
					children: [
						{ name: 'Musical', value: 1200 },
						{ name: 'Dramaturgia', value: 900 },
						{ name: 'Infantil', value: 600 },
					],
				},
				{
					name: 'Dança',
					children: [
						{ name: 'Ballet', value: 700 },
						{ name: 'Contemporanea', value: 500 },
						{ name: 'Popular', value: 400 },
					],
				},
			],
		},
		height: 450,
	}}
/>

<Story
	name="Flat Data"
	args={{
		data: {
			name: 'Regioes',
			children: [
				{ name: 'Sudeste', value: 4200 },
				{ name: 'Nordeste', value: 2800 },
				{ name: 'Sul', value: 1500 },
				{ name: 'Centro-Oeste', value: 900 },
				{ name: 'Norte', value: 600 },
			],
		},
		height: 350,
	}}
/>
