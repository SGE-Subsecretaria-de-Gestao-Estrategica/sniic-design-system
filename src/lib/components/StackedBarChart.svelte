<script lang="ts">
  import { onMount } from 'svelte';
  import { scaleLinear, scaleBand, stack, max } from 'd3';
  import { black, colorScales, typography, white } from '../tokens.js';
  import type { StackedBarRow } from '../charts/stackedBarChart.js';
  import { BRL } from '../utils/formatters.js';
  import XAxis from './atoms/XAxis.svelte';
  import GridLines from './atoms/GridLines.svelte';

  interface Props {
    data?: StackedBarRow[];
    flag?: boolean;
  }

  let { data = [], flag = true }: Props = $props();

  const chartFont = typography.chartValueFontFamily;

  const MARGIN  = { top: 16, right: 28, bottom: 12, left: 50 };
  /** Espaço sob a área das barras para rótulos do eixo X. */
  const X_AXIS_LABEL_RESERVE = 22;
  /** Faixa horizontal da legenda (altura + borda). */
  const LEGEND_BAR_H = 34;
  const LEGEND_TEXT_PAD = 12;
  const ROW_HEIGHT = 52;
  const FLAG_W  = 32;
  const FLAG_H  = 20;
  const COLORS  = { audiovisual: colorScales.yellow[2], demais: colorScales.blue[2] } as const;
  const STROKE_W = 0.5;
  const SEGMENT_LABEL_PAD = 6;
  const SEGMENT_LABEL_RIGHT_MARGIN = 4;
  const LABEL_FONT_WEIGHT = 700;

  let _labelMeasureCtx: CanvasRenderingContext2D | null = null;

  function segmentLabelFontSize(band: number): number {
    return Math.min(13, Math.max(11, band * 0.38));
  }

  /** Largura do texto no mesmo `font` do rótulo (canvas; fallback em SSR). */
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

  function segmentLabelFitsInBar(label: string, fontSize: number, segW: number): boolean {
    if (segW <= 0) return false;
    const textW = measureSegmentLabelWidthPx(label, fontSize);
    const needed = SEGMENT_LABEL_PAD + textW + SEGMENT_LABEL_RIGHT_MARGIN;
    return segW >= needed;
  }

  function segmentValue(key: string, row: StackedBarRow): number {
    return key === 'audiovisual' ? row.audiovisual : row.demais;
  }

  /** Contraste: escuro no segmento mais claro, branco no mais escuro. */
  function segmentLabelFill(key: string): string {
    return key === 'demais' ? white : black;
  }

  const UF_MAP: Record<string, string> = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
    'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
    'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS',
    'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
    'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
  };

  // D3 stack generator — stateless, safe to define once.
  const stackGen = stack<StackedBarRow>().keys(['audiovisual', 'demais']);

  const legendItems = Object.entries(COLORS).map(([key, color]) => ({
    label: key === 'audiovisual' ? 'Audiovisual' : 'Demais Áreas',
    color,
  }));

  let containerEl: HTMLDivElement | undefined = $state();
  let width = $state(0);
  let flagDataURIs = $state<Record<string, string>>({});

  const sorted = $derived(
    [...data]
      .filter(d => d.uf !== 'Todos (Brasil)')
      .sort((a, b) => (b.audiovisual + b.demais) - (a.audiovisual + a.demais))
  );

  const innerW = $derived(width - MARGIN.left - MARGIN.right);
  const innerH = $derived(sorted.length * ROW_HEIGHT);
  const legendBarY = $derived(innerH + X_AXIS_LABEL_RESERVE);
  const legendHalfW = $derived(innerW / 2);
  const height = $derived(
    MARGIN.top + innerH + X_AXIS_LABEL_RESERVE + LEGEND_BAR_H + MARGIN.bottom
  );

  const xMax = $derived(max(sorted, d => d.audiovisual + d.demais) ?? 1);

  const xScale = $derived(
    scaleLinear().domain([0, xMax]).range([0, innerW]).nice()
  );

  const yScale = $derived(
    scaleBand()
      .domain(sorted.map(d => d.uf))
      .range([0, innerH])
      .padding(0.28)
  );

  const stackLayout = $derived(stackGen(sorted));

  const xTickValues = $derived(xScale.ticks(5));

  const xTicks = $derived(
    xTickValues.map(v => ({ value: BRL.format(v), x: xScale(v) }))
  );

  const xGridPositions = $derived(xTickValues.map(v => xScale(v)));

  onMount(() => {
    width = containerEl!.clientWidth;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(containerEl!);

    if (flag) {
      const ufs = [...new Set(sorted.map(d => UF_MAP[d.uf]).filter(Boolean))];
      Promise.all(
        ufs.map(async (uf) => {
          try {
            const res = await fetch(`/flags/states/${uf}.svg`);
            const blob = await res.blob();
            return new Promise<[string, string]>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve([uf, reader.result as string]);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch {
            return [uf, ''] as [string, string];
          }
        })
      ).then(entries => {
        flagDataURIs = Object.fromEntries(entries.filter(([, v]) => v));
      });
    }

    return () => ro.disconnect();
  });
</script>

<!-- Space Grotesk (SIL OFL) — tipografia única deste gráfico; carrega com o componente. -->
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
        <!-- Vertical grid lines -->
        <GridLines
          type="vertical"
          positions={xGridPositions}
          length={innerH}
          color={black}
          opacity={0.15}
          dashed
        />

        <!-- Stacked horizontal bars + valor por segmento -->
        {#each stackLayout as layer (layer.key)}
          {@const stackKey = layer.key as keyof typeof COLORS}
          {@const fill = COLORS[stackKey]}
          {#each layer as segment (segment.data.uf)}
            {@const segX = xScale(segment[0])}
            {@const segW = Math.max(0, xScale(segment[1]) - xScale(segment[0]))}
            {@const segY = yScale(segment.data.uf) ?? 0}
            {@const band = yScale.bandwidth()}
            {@const amount = segmentValue(layer.key, segment.data)}
            {@const labelFs = segmentLabelFontSize(band)}
            {@const labelText = BRL.format(amount)}
            <rect
              y={segY}
              x={segX}
              width={segW}
              height={band}
              fill={fill}
              stroke={black}
              stroke-width={STROKE_W}
              shape-rendering="crispEdges"
            />
            {#if amount > 0 && segmentLabelFitsInBar(labelText, labelFs, segW)}
              <text
                x={segX + SEGMENT_LABEL_PAD}
                y={segY + band / 2}
                dy="0.35em"
                fill={segmentLabelFill(layer.key)}
                font-size={labelFs}
                font-weight={LABEL_FONT_WEIGHT}
                font-family={chartFont}
                pointer-events="none"
              >{labelText}</text>
            {/if}
          {/each}
        {/each}

        <!-- Total value labels after the last bar -->
        {#each sorted as d (d.uf)}
          <text
            x={xScale(d.audiovisual + d.demais) + 6}
            y={(yScale(d.uf) ?? 0) + yScale.bandwidth() / 2}
            dy="0.35em"
            font-size={10}
            font-weight="500"
            font-family={chartFont}
            fill={black}
          >{BRL.format(d.audiovisual + d.demais)}</text>
        {/each}

        <!-- State flag images on Y axis -->
        {#each sorted as d (d.uf)}
          {@const uf = UF_MAP[d.uf]}
          {@const barCenter = (yScale(d.uf) ?? 0) + yScale.bandwidth() / 2}
          {#if uf && flag}
            {#if flagDataURIs[uf]}
              <image
                href={flagDataURIs[uf]}
                x={-(FLAG_W + 4)}
                y={barCenter - FLAG_H / 2}
                width={FLAG_W}
                height={FLAG_H}
                preserveAspectRatio="xMidYMid meet"
              />
            {/if}
            <text
              x={-(FLAG_W / 2 + 4)}
              y={barCenter + FLAG_H / 2 + 10}
              text-anchor="middle"
              font-size={9}
              font-weight="600"
              font-family={chartFont}
              fill={black}
            >{uf}</text>
          {:else if uf}
            <text
              x={-8}
              y={barCenter}
              text-anchor="end"
              dominant-baseline="middle"
              font-size={11}
              font-weight="600"
              font-family={chartFont}
              fill={black}
            >{uf}</text>
          {:else}
            <text
              x={-8}
              y={barCenter}
              text-anchor="end"
              dominant-baseline="middle"
              font-size={11}
              font-family={chartFont}
              fill="#a0a0a0"
            >{d.uf}</text>
          {/if}
        {/each}

        <!-- X axis (bottom, BRL) -->
        <XAxis
          ticks={xTicks}
          innerHeight={innerH}
          innerWidth={innerW}
          showLine={false}
          color="#555555"
          fontSize={10}
          fontFamily={chartFont}
        />

        <!-- Legenda: metade/metade com as cores do stack, rótulo à esquerda em cada faixa -->
        <rect
          x={0}
          y={legendBarY}
          width={legendHalfW}
          height={LEGEND_BAR_H}
          fill={COLORS.audiovisual}
          shape-rendering="crispEdges"
        />
        <rect
          x={legendHalfW}
          y={legendBarY}
          width={legendHalfW}
          height={LEGEND_BAR_H}
          fill={COLORS.demais}
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
          fill={segmentLabelFill('audiovisual')}
        >{legendItems[0].label}</text>
        <text
          x={legendHalfW + LEGEND_TEXT_PAD}
          y={legendBarY + LEGEND_BAR_H / 2}
          dy="0.35em"
          font-size={typography.sizes.sm}
          font-weight="600"
          font-family={chartFont}
          fill={segmentLabelFill('demais')}
        >{legendItems[1].label}</text>
      </g>
    </svg>
  {/if}
</div>

<style>
  .chart-container {
    width: 100%;
  }
  svg {
    display: block;
    width: 100%;
  }
</style>
