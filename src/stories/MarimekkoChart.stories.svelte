<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MarimekkoChart from '../lib/components/MarimekkoChart.svelte';

	const { Story } = defineMeta({
		title: 'Charts/MarimekkoChart',
		component: MarimekkoChart,
		tags: ['autodocs'],
		argTypes: {
			height: { control: { type: 'range', min: 200, max: 600, step: 50 } },
			columnGap: { control: { type: 'range', min: 0, max: 8, step: 1 } },
		},
	});
</script>

<Story
	name="Default"
	args={{
		data: [
			{ label: 'Sudeste', total: 4500, music: 1800, film: 1200, theater: 900, dance: 600 },
			{ label: 'Nordeste', total: 2800, music: 1000, film: 800, theater: 600, dance: 400 },
			{ label: 'Sul', total: 1900, music: 700, film: 500, theater: 400, dance: 300 },
			{ label: 'Centro-Oeste', total: 900, music: 350, film: 250, theater: 180, dance: 120 },
			{ label: 'Norte', total: 600, music: 200, film: 180, theater: 120, dance: 100 },
		],
		keys: ['music', 'film', 'theater', 'dance'],
		labels: { music: 'Musica', film: 'Cinema', theater: 'Teatro', dance: 'Danca' },
		height: 400,
	}}
/>

<Story
	name="Two Segments"
	args={{
		data: [
			{ label: '2020', total: 3200, public: 1800, private: 1400 },
			{ label: '2021', total: 4100, public: 2200, private: 1900 },
			{ label: '2022', total: 5500, public: 2800, private: 2700 },
			{ label: '2023', total: 6800, public: 3200, private: 3600 },
		],
		keys: ['public', 'private'],
		labels: { public: 'Publico', private: 'Privado' },
		height: 350,
	}}
/>
