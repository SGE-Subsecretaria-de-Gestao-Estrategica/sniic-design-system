<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import GroupedColumnChart from '../lib/components/GroupedColumnChart.svelte';

	const { Story } = defineMeta({
		title: 'Charts/GroupedColumnChart',
		component: GroupedColumnChart,
		tags: ['autodocs'],
		argTypes: {
			height: { control: { type: 'range', min: 200, max: 600, step: 50 } },
		},
	});
</script>

<Story
	name="Default"
	args={{
		data: [
			{ label: '2020', music: 3200, film: 2100, theater: 1400 },
			{ label: '2021', music: 3800, film: 2400, theater: 1600 },
			{ label: '2022', music: 4200, film: 2800, theater: 1900 },
			{ label: '2023', music: 4800, film: 3100, theater: 2200 },
		],
		keys: ['music', 'film', 'theater'],
		labels: { music: 'Musica', film: 'Cinema', theater: 'Teatro' },
		height: 400,
	}}
/>

<Story
	name="Two Groups"
	args={{
		data: [
			{ label: 'SP', public: 4200, private: 3800 },
			{ label: 'RJ', public: 2800, private: 2100 },
			{ label: 'MG', public: 2200, private: 1900 },
			{ label: 'BA', public: 1400, private: 900 },
			{ label: 'RS', public: 1200, private: 1100 },
		],
		keys: ['public', 'private'],
		labels: { public: 'Publico', private: 'Privado' },
		height: 380,
	}}
/>

<Story
	name="Many Categories"
	args={{
		data: [
			{ label: 'Jan', a: 42, b: 35, c: 28, d: 20 },
			{ label: 'Fev', a: 55, b: 40, c: 32, d: 25 },
			{ label: 'Mar', a: 48, b: 52, c: 38, d: 30 },
			{ label: 'Abr', a: 62, b: 45, c: 42, d: 35 },
			{ label: 'Mai', a: 70, b: 58, c: 48, d: 40 },
			{ label: 'Jun', a: 85, b: 65, c: 55, d: 45 },
		],
		keys: ['a', 'b', 'c', 'd'],
		labels: { a: 'Serie A', b: 'Serie B', c: 'Serie C', d: 'Serie D' },
		height: 420,
	}}
/>
