<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProportionalAreaChart from '../lib/components/ProportionalAreaChart.svelte';

	const { Story } = defineMeta({
		title: 'Charts/ProportionalAreaChart',
		component: ProportionalAreaChart,
		tags: ['autodocs'],
		argTypes: {
			maxRadius: { control: { type: 'range', min: 30, max: 120, step: 5 } },
			showLabels: { control: 'boolean' },
		},
	});
</script>

<Story
	name="Default"
	args={{
		data: [
			{ label: 'Sudeste', value: 4200 },
			{ label: 'Nordeste', value: 2800 },
			{ label: 'Sul', value: 1500 },
			{ label: 'Centro-Oeste', value: 900 },
			{ label: 'Norte', value: 600 },
		],
		maxRadius: 80,
	}}
/>

<Story
	name="Many Items"
	args={{
		data: [
			{ label: 'SP', value: 12000 },
			{ label: 'RJ', value: 6500 },
			{ label: 'MG', value: 4800 },
			{ label: 'BA', value: 3200 },
			{ label: 'RS', value: 2900 },
			{ label: 'PR', value: 2600 },
			{ label: 'PE', value: 2100 },
			{ label: 'CE', value: 1800 },
		],
		maxRadius: 70,
	}}
/>

<Story
	name="Small Radius"
	args={{
		data: [
			{ label: 'A', value: 100 },
			{ label: 'B', value: 80 },
			{ label: 'C', value: 60 },
			{ label: 'D', value: 40 },
			{ label: 'E', value: 20 },
			{ label: 'F', value: 10 },
		],
		maxRadius: 40,
	}}
/>
