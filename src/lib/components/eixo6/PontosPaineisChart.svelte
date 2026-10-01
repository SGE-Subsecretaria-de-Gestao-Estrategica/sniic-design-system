<script lang="ts">
	/**
	 * Pontos em painéis: um ponto por unidade, a mesma grade repetida em cada
	 * painel e repartida de um jeito diferente em cada um.
	 *
	 * The family's marker, counted: every dot is one unit, so the area of each
	 * block is the count itself. Dots fill in reading order and slices follow
	 * in sequence, so each slice is one contiguous block — scattering the
	 * colours would turn area into noise. Every panel has the same grid and
	 * the same total; what moves from panel to panel is only where the
	 * boundaries between colours fall, and that comparison is the point.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { PontosPainel } from './data.js';
	import { seriesColors } from './scales.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			panels: PontosPainel[];
			/** Dots per grid row. */
			gridColumns?: number;
			/** Panels per row of the figure; one in a narrow column. */
			panelColumns?: number;
			/** Overrides the Eixo 6 palette — used for style previews in other eixos. */
			pillarId?: number;
		};

	let {
		panels,
		gridColumns = 30,
		panelColumns = 2,
		width,
		height,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		pillarId = 6
	}: Props = $props();

	let theme = $derived(getPillarTheme(pillarId));
	const hover = new HoverState();
	const shows = (stage: number) => step < 0 || step >= stage;
	const intFormat = formatLocale.format(',d');
	const pctFormat = formatLocale.format('.1%');

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);
	let compact = $derived(shellWidth < 520);

	const PANEL_GAP = 28;
	const TITLE = 22;
	const LEGEND_ROW = 16;
	let perRow = $derived(compact ? 1 : Math.max(1, panelColumns));
	let margin = { top: 4, right: 8, bottom: 8, left: 8 };
	let plotWidth = $derived(Math.max(0, shellWidth - margin.left - margin.right));
	let panelWidth = $derived((plotWidth - PANEL_GAP * (perRow - 1)) / perRow);

	let total = $derived(d3.max(panels, (p) => d3.sum(p.slices, (s) => s.n)) ?? 0);
	let gridRows = $derived(Math.ceil(total / gridColumns));
	let pitch = $derived(panelWidth / gridColumns);
	let dotRadius = $derived(pitch * 0.36);
	let gridHeight = $derived(gridRows * pitch);
	let legendRows = $derived(d3.max(panels, (p) => p.slices.length) ?? 0);
	let panelHeight = $derived(TITLE + gridHeight + 8 + legendRows * LEGEND_ROW);

	let layout = $derived(
		panels.map((panel, index) => {
			const col = index % perRow;
			const row = Math.floor(index / perRow);
			const palette = seriesColors(theme.palette, panel.slices.length);
			const colors = panel.slices.map((s, i) => s.color ?? palette[i]);
			// One colour per dot, in reading order: each slice a contiguous block.
			const dotColors: string[] = [];
			panel.slices.forEach((s, i) => {
				for (let k = 0; k < s.n; k++) dotColors.push(colors[i]);
			});
			return {
				...panel,
				index,
				x: col * (panelWidth + PANEL_GAP),
				y: row * (panelHeight + PANEL_GAP),
				colors,
				dotColors,
				total: d3.sum(panel.slices, (s) => s.n)
			};
		})
	);

	let plotHeight = $derived(
		Math.ceil(panels.length / perRow) * (panelHeight + PANEL_GAP) - PANEL_GAP
	);
	let figureHeight = $derived(height ?? plotHeight + margin.top + margin.bottom);

	let dots = $derived(
		d3.range(total).map((i) => ({
			i,
			cx: (i % gridColumns) * pitch + pitch / 2,
			cy: Math.floor(i / gridColumns) * pitch + pitch / 2
		}))
	);

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activePanel = $derived(activeIndex === null ? null : layout[activeIndex]);

	function panelOpacity(title: string) {
		return highlight !== null && highlight !== title ? 0.25 : 1;
	}

	let tooltip = $derived(
		activePanel
			? {
					title: activePanel.title,
					rows: activePanel.slices.map((s, i) => ({
						label: s.label,
						value: `${intFormat(s.n)} · ${pctFormat(s.n / (activePanel.total || 1))}`,
						color: activePanel.colors[i]
					}))
				}
			: null
	);

	let table = $derived({
		caption: title ?? 'Pontos em painéis',
		columns: ['Painel', 'Fatia', 'Quantidade', 'Participação'],
		rows: layout.flatMap((p) =>
			p.slices.map((s) => [p.title, s.label, intFormat(s.n), pctFormat(s.n / (p.total || 1))])
		)
	});
</script>

<ChartShell
	{theme}
	{width}
	bind:measuredWidth={shellWidth}
	height={figureHeight}
	{margin}
	{title}
	{subtitle}
	{source}
	{hover}
	{tooltip}
	{table}
	ariaLabel={title ?? 'Pontos em painéis'}
>
	{#snippet children({ container })}
		{#if layout.length && plotWidth > 0}
			{#each layout as panel (panel.index)}
				<g class="fade" transform="translate({panel.x},{panel.y})" style:opacity={panelOpacity(panel.title)}>
					<Text
						dx={0}
						dy={0}
						text={panel.title}
						verticalAnchor="start"
						fontSize={Tokens.fontSize.md}
						fontWeight={Tokens.fontWeight.semibold}
						fill={theme.palette.neutral[300]}
					/>
					<g transform="translate(0,{TITLE})">
						{#each dots as dot (dot.i)}
							<circle
								class="dot"
								cx={dot.cx}
								cy={dot.cy}
								r={dotRadius}
								fill={shows(1) ? (panel.dotColors[dot.i] ?? theme.palette.base[300]) : theme.palette.base[300]}
							/>
						{/each}
					</g>
					<g class="fade" style:opacity={shows(1) ? 1 : 0}>
						{#each panel.slices as slice, i (slice.label)}
							{@const ly = TITLE + gridHeight + 8 + i * LEGEND_ROW + LEGEND_ROW / 2}
							<circle cx={5} cy={ly} r={4.5} fill={panel.colors[i]} />
							<Text
								dx={14}
								dy={ly}
								text={`${slice.label} · ${intFormat(slice.n)}`}
								verticalAnchor="middle"
								fontSize={Tokens.fontSize.sm}
								fill={theme.palette.neutral[200]}
							/>
						{/each}
					</g>
					{#if interactive}
						<HitTarget
							{hover}
							{container}
							index={panel.index}
							x={0}
							y={0}
							width={panelWidth}
							height={panelHeight}
							label="{panel.title}: {panel.slices.map((s) => `${s.label} ${intFormat(s.n)}`).join(', ')}"
						/>
					{/if}
				</g>
			{/each}
		{/if}
	{/snippet}
</ChartShell>

<style>
	.fade {
		transition: opacity 450ms ease-out;
	}

	.dot {
		transition: fill 450ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.fade,
		.dot {
			transition: none;
		}
	}
</style>
