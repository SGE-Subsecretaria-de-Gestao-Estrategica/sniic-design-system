<script lang="ts">
  import { onMount } from 'svelte';
  import { scaleLinear, scaleBand } from 'd3';
  import { amber, black, colorScales, typography, white } from '../tokens.js';
  import type { GenderRow } from '../charts/genderDivergingBar.js';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import GridLines from './atoms/GridLines.svelte';

  interface Props {
    data?: GenderRow[];
    nationalAvg?: number;
  }

  let { data = [], nationalAvg = 0 }: Props = $props();

  const chartFont = typography.chartValueFontFamily;

  const MARGIN = { top: 28, right: 28, bottom: 12, left: 130 };
  const X_AXIS_LABEL_RESERVE = 22;
  const LEGEND_BAR_H = 34;
  const LEGEND_TEXT_PAD = 12;
  const ROW_HEIGHT = 52;
  const STROKE_W = 0.5;
  const SEGMENT_LABEL_PAD = 6;
  const SEGMENT_LABEL_RIGHT_MARGIN = 4;
  const LABEL_FONT_WEIGHT = 700;

  const COLORS = { feminino: colorScales.red[3], masculino: colorScales.blue[2] } as const;

  const legendItems = Object.entries(COLORS).map(([key, color]) => ({
    label: key === 'feminino' ? 'Feminino' : 'Masculino',
    color,
  }));

  let _labelMeasureCtx: CanvasRenderingContext2D | null = null;

  function segmentLabelFontSize(band: number): number {
    return Math.min(13, Math.max(11, band * 0.38));
  }

  function measureSegmentLabelWidthPx(label: string, fontSize: number): number {
    if (typeof document === 'undefined') {
      return label.length * fontSize * 0.62;
    }
    if (!_labelMeasureCtx) {
      const c = document.createElement('canvas');
      _labelMeasureCtx = c.getContext('2d');
    }
    const ctx = _labelMeasureCtx;
    if (!ctx) return label.length * fontSize * 0.62;
    ctx.font = `${LABEL_FONT_WEIGHT} ${fontSize}px ${chartFont}`;
    return ctx.measureText(label).width;
  }

  function labelFitsInSegment(label: string, fontSize: number, segW: number): boolean {
    if (segW <= 0) return false;
    const textW = measureSegmentLabelWidthPx(label, fontSize);
    const needed = SEGMENT_LABEL_PAD + textW + SEGMENT_LABEL_RIGHT_MARGIN;
    return segW >= needed;
  }

  /** Contraste sobre fundos do stack (vermelho escuro / azul claro). */
  function divergingBarLabelFill(side: 'feminino' | 'masculino'): string {
    return side === 'feminino' ? white : black;
  }

  let containerEl: HTMLDivElement | undefined = $state();
  let width = $state(0);

  const sorted = $derived([...data].sort((a, b) => b.pctFeminino - a.pctFeminino));
  const innerH = $derived(sorted.length * ROW_HEIGHT);
  const innerW = $derived(width - MARGIN.left - MARGIN.right);
  const legendBarY = $derived(innerH + X_AXIS_LABEL_RESERVE);
  const legendHalfW = $derived(innerW / 2);
  const height = $derived(
    MARGIN.top + innerH + X_AXIS_LABEL_RESERVE + LEGEND_BAR_H + MARGIN.bottom
  );

  const xScale = $derived(scaleLinear().domain([0, 100]).range([0, innerW]));

  const yScale = $derived(
    scaleBand()
      .domain(sorted.map(d => d.uf))
      .range([0, innerH])
      .padding(0.28)
  );

  const xTickValues = $derived(xScale.ticks(5));
  const xTicks = $derived(xTickValues.map(v => ({ value: `${v}%`, x: xScale(v) })));
  const xGridPositions = $derived(xTickValues.map(v => xScale(v)));

  const yTicks = $derived(
    sorted.map(d => ({
      value: d.uf,
      y: (yScale(d.uf) ?? 0) + yScale.bandwidth() / 2,
    }))
  );

  onMount(() => {
    width = containerEl!.clientWidth;
    const ro = new ResizeObserver(([e]) => {
      width = e.contentRect.width;
    });
    ro.observe(containerEl!);
    return () => ro.disconnect();
  });
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div bind:this={containerEl} class="chart-container">
  {#if width > 0}
    <svg {width} {height} font-family={chartFont} style="overflow: visible;">
      <g transform="translate({MARGIN.left},{MARGIN.top})">
        <GridLines
          type="vertical"
          positions={xGridPositions}
          length={innerH}
          color={black}
          dashed
        />

        <!-- Linha central 50% -->
        <line
          x1={xScale(50)}
          x2={xScale(50)}
          y1={0}
          y2={innerH}
          stroke={black}
          stroke-width={STROKE_W}
          shape-rendering="crispEdges"
        />

        {#if nationalAvg > 0}
          <line
            x1={xScale(nationalAvg)}
            x2={xScale(nationalAvg)}
            y1={-8}
            y2={innerH}
            stroke={amber}
            stroke-width={STROKE_W}
            stroke-dasharray="4,3"
          />
          <text
            x={xScale(nationalAvg) + 4}
            y={-12}
            font-size={10}
            font-weight="500"
            font-family={chartFont}
            fill={amber}
          >média {nationalAvg.toFixed(1)}%</text>
        {/if}

        {#each sorted as d}
          <rect
            x={0}
            y={yScale(d.uf) ?? 0}
            width={xScale(d.pctFeminino)}
            height={yScale.bandwidth()}
            fill={COLORS.feminino}
            stroke={black}
            stroke-width={STROKE_W}
            shape-rendering="crispEdges"
          />
        {/each}

        {#each sorted as d}
          {@const wMasc = xScale(100 - d.pctFeminino)}
          <rect
            x={xScale(d.pctFeminino)}
            y={yScale(d.uf) ?? 0}
            width={wMasc}
            height={yScale.bandwidth()}
            fill={COLORS.masculino}
            stroke={black}
            stroke-width={STROKE_W}
            shape-rendering="crispEdges"
          />
        {/each}

        {#each sorted as d}
          {@const band = yScale.bandwidth()}
          {@const labelFs = segmentLabelFontSize(band)}
          {@const yMid = (yScale(d.uf) ?? 0) + band / 2}
          {@const segFem = xScale(d.pctFeminino)}
          {@const segMasc = xScale(100 - d.pctFeminino)}
          {@const txtFem = `${d.pctFeminino.toFixed(0)}%`}
          {@const txtMasc = `${(100 - d.pctFeminino).toFixed(0)}%`}
          {#if d.pctFeminino > 0 && labelFitsInSegment(txtFem, labelFs, segFem)}
            <text
              x={xScale(d.pctFeminino) - SEGMENT_LABEL_PAD}
              y={yMid}
              dy="0.35em"
              text-anchor="end"
              font-size={labelFs}
              font-weight={LABEL_FONT_WEIGHT}
              font-family={chartFont}
              fill={divergingBarLabelFill('feminino')}
              pointer-events="none"
            >{txtFem}</text>
          {/if}
          {#if 100 - d.pctFeminino > 0 && labelFitsInSegment(txtMasc, labelFs, segMasc)}
            <text
              x={xScale(d.pctFeminino) + SEGMENT_LABEL_PAD}
              y={yMid}
              dy="0.35em"
              text-anchor="start"
              font-size={labelFs}
              font-weight={LABEL_FONT_WEIGHT}
              font-family={chartFont}
              fill={divergingBarLabelFill('masculino')}
              pointer-events="none"
            >{txtMasc}</text>
          {/if}
        {/each}

        <XAxis
          ticks={xTicks}
          innerHeight={innerH}
          innerWidth={innerW}
          showLine={false}
          color="#555555"
          fontSize={10}
          fontFamily={chartFont}
        />
        <YAxis
          ticks={yTicks}
          innerHeight={innerH}
          showLine={false}
          color="#a0a0a0"
          fontSize={11}
          tickOffset={-8}
          fontFamily={chartFont}
        />

        <rect
          x={0}
          y={legendBarY}
          width={legendHalfW}
          height={LEGEND_BAR_H}
          fill={COLORS.feminino}
          shape-rendering="crispEdges"
        />
        <rect
          x={legendHalfW}
          y={legendBarY}
          width={legendHalfW}
          height={LEGEND_BAR_H}
          fill={COLORS.masculino}
          shape-rendering="crispEdges"
        />
        <line
          x1={legendHalfW}
          y1={legendBarY}
          x2={legendHalfW}
          y2={legendBarY + LEGEND_BAR_H}
          stroke={black}
          stroke-width={STROKE_W}
          shape-rendering="crispEdges"
        />
        <rect
          x={0}
          y={legendBarY}
          width={innerW}
          height={LEGEND_BAR_H}
          fill="none"
          stroke={black}
          stroke-width={STROKE_W}
          shape-rendering="crispEdges"
        />
        <text
          x={LEGEND_TEXT_PAD}
          y={legendBarY + LEGEND_BAR_H / 2}
          dy="0.35em"
          font-size={typography.sizes.sm}
          font-weight="600"
          font-family={chartFont}
          fill={divergingBarLabelFill('feminino')}
        >{legendItems[0].label}</text>
        <text
          x={legendHalfW + LEGEND_TEXT_PAD}
          y={legendBarY + LEGEND_BAR_H / 2}
          dy="0.35em"
          font-size={typography.sizes.sm}
          font-weight="600"
          font-family={chartFont}
          fill={divergingBarLabelFill('masculino')}
        >{legendItems[1].label}</text>
      </g>
    </svg>
  {/if}
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
  }
  svg {
    display: block;
    width: 100%;
  }
</style>
