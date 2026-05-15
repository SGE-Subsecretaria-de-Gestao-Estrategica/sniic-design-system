<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ParliamentChart from '../lib/components/ParliamentChart.svelte';

	const { Story } = defineMeta({
		title: 'Charts/ParliamentChart',
		component: ParliamentChart,
		tags: ['autodocs'],
		argTypes: {
			height: { control: { type: 'range', min: 200, max: 600, step: 50 } },
			rows: { control: { type: 'range', min: 2, max: 8, step: 1 } },
			showLegend: { control: 'boolean' },
		},
	});
</script>

<Story
	name="Default"
	args={{
		data: [
			{ label: 'Partido A', seats: 120 },
			{ label: 'Partido B', seats: 85 },
			{ label: 'Partido C', seats: 62 },
			{ label: 'Partido D', seats: 45 },
			{ label: 'Partido E', seats: 30 },
			{ label: 'Outros', seats: 18 },
		],
		height: 360,
		rows: 5,
	}}
/>

<Story
	name="Two Parties"
	args={{
		data: [
			{ label: 'Governo', seats: 270 },
			{ label: 'Oposicao', seats: 243 },
		],
		height: 360,
		rows: 5,
	}}
/>

<Story
	name="Small Chamber"
	args={{
		data: [
			{ label: 'Situacao', seats: 15 },
			{ label: 'Oposicao', seats: 10 },
			{ label: 'Independentes', seats: 6 },
		],
		height: 300,
		rows: 3,
	}}
/>
