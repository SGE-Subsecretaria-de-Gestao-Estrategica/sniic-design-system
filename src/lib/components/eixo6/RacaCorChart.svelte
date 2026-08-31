<script lang="ts">
	/**
	 * Composição dos trabalhadores por cor ou raça, na Economia Criativa e no
	 * Brasil.
	 *
	 * Two columns of proportional-area bubbles on shared category rows. Colour
	 * encodes *scope* (creative economy vs. the country) and area encodes the
	 * share — categories are named in the gutter, so no hue is ever asked to
	 * stand in for an identity. The country column is a hatched reference fill:
	 * the same distinction survives colourblind vision, print, and forced
	 * colours.
	 *
	 * Rows are ordered by the creative-economy share, but the fill ramp is keyed
	 * to the value, never to that rank — a category keeps its shade when the
	 * ordering changes.
	 */
	import * as d3 from 'd3';
	import Text from '$lib/core/components/Text.svelte';
	import HitTarget from '$lib/core/components/interaction/HitTarget.svelte';
	import { HoverState } from '$lib/core/interaction/hover.svelte.js';
	import { Tokens, getPillarTheme } from '$lib/core/theme';
	import { formatLocale } from '$lib/core/format';
	import ChartShell from './ChartShell.svelte';
	import type { RacaCorDatum, RacaCorScope } from './data.js';
	import type { FrameProps, ScrollytellingProps } from './types.js';

	type Props = FrameProps &
		ScrollytellingProps & {
			data: RacaCorDatum[];
			/** Categories left out of the plot; reported in a footnote instead. */
			excluded?: string[];
			scopeLabels?: Record<RacaCorScope, string>;
		};

	let {
		data,
		width,
		height,
		title,
		subtitle,
		source,
		step = -1,
		highlight = null,
		focusIndex = null,
		interactive = true,
		excluded = ['Não identificado'],
		scopeLabels = { EC: 'Economia Criativa', BR: 'Brasil' }
	}: Props = $props();

	const theme = getPillarTheme(6);
	const pctFormat = formatLocale.format('.1%');
	const hover = new HoverState();
	const uid = $props.id();

	const shows = (stage: number) => step < 0 || step >= stage;

	const SCOPES: RacaCorScope[] = ['EC', 'BR'];

	// Written back by the shell once it has measured (or from `width`).
	let shellWidth = $state(0);

	const HEADER_HEIGHT = 26;
	const ROW_GAP = 18;
	/** Floor on row spacing, so rows of tiny bubbles still fit their labels. */
	const MIN_ROW_STEP = 36;
	const MARGIN = { top: 12, right: 16, bottom: 16, left: 16 };

	let compact = $derived(shellWidth < 520);
	let gutter = $derived(compact ? 96 : 150);
	let plotWidth = $derived(Math.max(0, shellWidth - MARGIN.left - MARGIN.right));
	let columnWidth = $derived(Math.max(0, (plotWidth - gutter) / 2));
	let maxRadius = $derived(Math.min(columnWidth * 0.3, compact ? 34 : 46));

	let plotted = $derived(data.filter((d) => !excluded.includes(d.category)));
	let omitted = $derived(
		data.filter((d) => excluded.includes(d.category) && d.scope === 'EC')
	);

	let shares = $derived(plotted.map((d) => d.share));

	/** Area is proportional to the share; radius follows from the area. */
	let radiusOf = $derived.by(() => {
		const max = d3.max(shares) ?? 1;
		const maxArea = Math.PI * maxRadius ** 2;
		const areaScale = d3.scaleLinear().domain([0, max]).range([0, maxArea]);
		return (share: number) => Math.sqrt(areaScale(share) / Math.PI);
	});

	/** Single-hue sequential ramp, light to dark, keyed to the share itself. */
	let fillOf = $derived.by(() => {
		const scale = d3
			.scaleSequential()
			.domain([0, d3.max(shares) ?? 1])
			.interpolator(d3.interpolateLab('#FDE9B0', theme.palette.primaryVariant));
		return (share: number) => scale(share);
	});

	type Bubble = {
		scope: RacaCorScope;
		category: string;
		share: number;
		label: string;
		x: number;
		y: number;
		r: number;
		fill: string;
	};

	/** Row order: largest creative-economy share first. */
	let categories = $derived.by(() => {
		const ec = plotted.filter((d) => d.scope === 'EC');
		const ordered = (ec.length ? ec : plotted)
			.slice()
			.sort((a, b) => b.share - a.share)
			.map((d) => d.category);
		// Anything present only in the reference scope still gets a row.
		for (const d of plotted) if (!ordered.includes(d.category)) ordered.push(d.category);
		return ordered;
	});

	let rows = $derived.by(() => {
		const result: { category: string; y: number; radius: number }[] = [];
		let cursor = HEADER_HEIGHT;

		for (const category of categories) {
			const radius = d3.max(
				plotted.filter((d) => d.category === category),
				(d) => radiusOf(d.share)
			) ?? 0;
			const step = Math.max(2 * radius + ROW_GAP, MIN_ROW_STEP);
			cursor += step / 2;
			result.push({ category, y: cursor, radius });
			cursor += step / 2;
		}

		return { rows: result, height: cursor };
	});

	let columnX = $derived({
		EC: gutter + columnWidth * 0.5,
		BR: gutter + columnWidth * 1.5
	});

	let bubbles = $derived<Bubble[]>(
		rows.rows.flatMap((row) =>
			plotted
				.filter((d) => d.category === row.category)
				.map((d) => ({
					scope: d.scope,
					category: d.category,
					share: d.share,
					label: pctFormat(d.share),
					x: columnX[d.scope] ?? columnX.EC,
					y: row.y,
					r: radiusOf(d.share),
					fill: d.scope === 'EC' ? fillOf(d.share) : `url(#${uid}-hatch)`
				}))
		)
	);

	/** Height follows the layout unless the host pins it. */
	let figureHeight = $derived(height ?? rows.height + MARGIN.top + MARGIN.bottom + 8);

	function scopeVisible(scope: RacaCorScope) {
		return scope === 'EC' ? true : shows(1);
	}

	function dimmed(category: string) {
		return highlight !== null && highlight !== category;
	}

	/** Step reveal and highlight dimming resolve to a single opacity. */
	function bubbleOpacity(bubble: Bubble) {
		if (!scopeVisible(bubble.scope)) return 0;
		return dimmed(bubble.category) ? 0.25 : 1;
	}

	let activeIndex = $derived(focusIndex ?? hover.index);
	let activeBubble = $derived(activeIndex === null ? null : bubbles[activeIndex]);

	let tooltip = $derived.by(() => {
		if (!activeBubble) return null;
		const category = activeBubble.category;

		const rowsOut = SCOPES
			.filter(scopeVisible)
			.map((scope) => {
				const match = plotted.find((d) => d.scope === scope && d.category === category);
				return match
					? {
							label: scopeLabels[scope],
							value: pctFormat(match.share),
							color: scope === 'EC' ? fillOf(match.share) : theme.palette.secondary,
							emphasis: scope === activeBubble.scope
						}
					: null;
			})
			.filter((row) => row !== null);

		return rowsOut.length ? { title: category, rows: rowsOut } : null;
	});

	/**
	 * Fill vs. hatch is the scope encoding; the key spells it out for readers
	 * who never hover, and for print.
	 */
	let legend = $derived(
		SCOPES.filter(scopeVisible).map((scope) => ({
			label: scopeLabels[scope],
			color: scope === 'EC' ? theme.palette.primaryVariant : theme.palette.secondary,
			hatched: scope === 'BR'
		}))
	);

	let table = $derived({
		caption: title ?? 'Participação por cor ou raça',
		columns: ['Cor ou raça', scopeLabels.EC, scopeLabels.BR],
		rows: categories.map((category) => [
			category,
			plotted.find((d) => d.scope === 'EC' && d.category === category)
				? pctFormat(plotted.find((d) => d.scope === 'EC' && d.category === category)!.share)
				: '—',
			plotted.find((d) => d.scope === 'BR' && d.category === category)
				? pctFormat(plotted.find((d) => d.scope === 'BR' && d.category === category)!.share)
				: '—'
		])
	});

	let footnote = $derived.by(() => {
		if (!omitted.length) return source;
		const note = `Não inclui ${omitted
			.map((d) => `${d.category.toLowerCase()} (${pctFormat(d.share)})`)
			.join(', ')}.`;
		return source ? `${note} ${source}` : note;
	});
</script>

<ChartShell
	{theme}
	{width}
	bind:measuredWidth={shellWidth}
	height={figureHeight}
	margin={MARGIN}
	{title}
	{subtitle}
	source={footnote}
	{hover}
	{tooltip}
	{legend}
	{table}
	ariaLabel={title ?? 'Participação dos trabalhadores por cor ou raça'}
>
	{#snippet children({ container })}
		{#if bubbles.length && plotWidth > 0}
			<defs>
				<!-- Reference scope reads as a texture, so the two columns stay
				     distinguishable without relying on hue. -->
				<pattern
					id="{uid}-hatch"
					width="4"
					height="4"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(45)"
				>
					<rect width="4" height="4" fill={theme.palette.base[100]} />
					<line
						x1="0"
						y1="0"
						x2="0"
						y2="4"
						stroke={theme.palette.secondary}
						stroke-width="1.3"
					/>
				</pattern>
			</defs>

			<!-- Column headers double as the legend: each names its own scope. -->
			{#each SCOPES as scope (scope)}
				<g class="fade" style:opacity={scopeVisible(scope) ? 1 : 0}>
					<Text
						dx={columnX[scope]}
						dy={0}
						text={scopeLabels[scope]}
						textAnchor="middle"
						verticalAnchor="start"
						fontSize={Tokens.fontSize.md}
						fontWeight={Tokens.fontWeight.semibold}
						fill={scope === 'EC' ? theme.palette.primaryVariant : theme.palette.secondary}
					/>
				</g>
			{/each}

			{#each rows.rows as row (row.category)}
				<g class="fade" style:opacity={dimmed(row.category) ? 0.25 : 1}>
					<Text
						dx={0}
						dy={row.y}
						width={gutter - Tokens.spacing.md}
						text={row.category}
						textAnchor="start"
						verticalAnchor="middle"
						fontSize={Tokens.fontSize.md}
						fontWeight={Tokens.fontWeight.medium}
						fill={theme.palette.neutral[300]}
					/>
				</g>
			{/each}

			{#each bubbles as bubble, i (`${bubble.scope}-${bubble.category}`)}
				{@const isActive = i === activeIndex}
				<g class="fade" style:opacity={bubbleOpacity(bubble)}>
					<circle
						cx={bubble.x}
						cy={bubble.y}
						r={bubble.r}
						fill={bubble.fill}
						stroke={bubble.scope === 'BR'
							? theme.palette.secondary
							: theme.palette.base[100]}
						stroke-width={isActive ? 2.5 : bubble.scope === 'BR' ? 1 : 2}
						class="bubble"
					/>

					<!-- Every bubble is labelled: the tooltip enhances, it never gates. -->
					<Text
						dx={bubble.x + bubble.r + Tokens.spacing.sm}
						dy={bubble.y}
						text={bubble.label}
						textAnchor="start"
						verticalAnchor="middle"
						fontSize={Tokens.fontSize.sm}
						fontWeight={isActive ? Tokens.fontWeight.bold : Tokens.fontWeight.medium}
						fill={theme.palette.neutral[isActive ? 400 : 200]}
					/>

					{#if interactive}
						<HitTarget
							{hover}
							{container}
							index={i}
							x={bubble.x}
							y={bubble.y}
							r={bubble.r}
							label="{bubble.category}, {scopeLabels[bubble.scope]}: {bubble.label}"
						/>
					{/if}
				</g>
			{/each}
		{/if}
	{/snippet}
</ChartShell>

<style>
	/* One pattern for every reveal and dim: the element owns its opacity
	   inline, this class owns the easing. */
	.fade {
		transition: opacity 450ms ease-out;
	}

	.bubble {
		transition: stroke-width 150ms ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.fade,
		.bubble {
			transition: none;
		}
	}
</style>
