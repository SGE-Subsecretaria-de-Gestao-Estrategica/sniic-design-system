<script lang="ts">
  import { onMount } from 'svelte';
  import { scaleLog, scaleSqrt, extent, max } from 'd3';
  import { green, amber, orange, blue, red, black } from '../tokens.js';
  import { getContrastColor } from '../utils/colorContrast.js';
  import type { BubbleScatterRow } from '../charts/bubbleScatter.js';
  import { BRL, NUM } from '../utils/formatters.js';
  import XAxis from './atoms/XAxis.svelte';
  import YAxis from './atoms/YAxis.svelte';
  import GridLines from './atoms/GridLines.svelte';
  import Legend from './atoms/Legend.svelte';
  import Tooltip from './molecules/Tooltip.svelte';

  interface Props {
    states?: Record<string, BubbleScatterRow>;
  }

  let { states = {} }: Props = $props();

  const MARGIN = { top: 24, right: 24, bottom: 52, left: 72 };

  // ── Static lookup tables ──────────────────────────────────────────────────

  const REGION_COLOR: Record<string, string> = {
    Norte: green, Nordeste: amber, 'Centro-Oeste': orange, Sudeste: blue, Sul: red,
  };

  const UF_REGION: Record<string, string> = {
    Acre: 'Norte',        Amapá: 'Norte',         Amazonas: 'Norte',
    Pará: 'Norte',        Rondônia: 'Norte',       Roraima: 'Norte',
    Tocantins: 'Norte',
    Alagoas: 'Nordeste',  Bahia: 'Nordeste',       Ceará: 'Nordeste',
    Maranhão: 'Nordeste', Paraíba: 'Nordeste',     Pernambuco: 'Nordeste',
    Piauí: 'Nordeste',    'Rio Grande do Norte': 'Nordeste', Sergipe: 'Nordeste',
    'Distrito Federal': 'Centro-Oeste', Goiás: 'Centro-Oeste',
    'Mato Grosso': 'Centro-Oeste',      'Mato Grosso do Sul': 'Centro-Oeste',
    'Espírito Santo': 'Sudeste', 'Minas Gerais': 'Sudeste',
    'Rio de Janeiro': 'Sudeste', 'São Paulo': 'Sudeste',
    Paraná: 'Sul', 'Rio Grande do Sul': 'Sul', 'Santa Catarina': 'Sul',
  };

  // ── Interaction helpers (pure functions) ──────────────────────────────────

  function buildTooltipHtml(d: BubbleScatterRow): string {
    return [
      `<strong>${d.uf}</strong>`,
      `Pop.: ${NUM.format(d.popTotal)}`,
      `Recebido: ${BRL.format(d.valorRecebido)}`,
      `Projetos: ${d.qtdFomentos.toLocaleString('pt-BR')}`,
      `Per capita: ${BRL.format(d.valorPerCapita)}`,
    ].join('<br/>');
  }

  /** Returns mouse coordinates relative to the given container element. */
  function relativePos(
    event: MouseEvent,
    container: HTMLElement,
  ): { x: number; y: number } {
    const rect = container.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  // ── Component state ───────────────────────────────────────────────────────

  let containerEl: HTMLDivElement | undefined = $state();
  let width = $state(0);

  let tooltip = $state({ visible: false, x: 0, y: 0, html: '' });

  const height    = $derived(Math.max(380, width * 0.5));
  const innerW    = $derived(width  - MARGIN.left - MARGIN.right);
  const innerH    = $derived(height - MARGIN.top  - MARGIN.bottom);

  const rows = $derived(
    Object.values(states).filter(s => s.popTotal > 0 && s.valorRecebido > 0)
  );

  // Log scales require a proper domain; guard against empty data.
  const xExtent = $derived(extent(rows, d => d.popTotal)       as [number, number]);
  const yExtent = $derived(extent(rows, d => d.valorRecebido)  as [number, number]);
  const maxQ    = $derived(max(rows, d => d.qtdFomentos)       ?? 1);

  const xScale = $derived(
    rows.length > 1
      ? scaleLog().domain(xExtent).range([0, innerW]).nice()
      : scaleLog().domain([1e4, 5e7]).range([0, innerW])
  );

  const yScale = $derived(
    rows.length > 1
      ? scaleLog().domain(yExtent).range([innerH, 0]).nice()
      : scaleLog().domain([1e6, 1e9]).range([innerH, 0])
  );

  const rScale = $derived(scaleSqrt().domain([0, maxQ]).range([4, 24]));

  // ── Tick arrays for atoms ─────────────────────────────────────────────────

  const xTickValues = $derived(xScale.ticks(5));
  const yTickValues = $derived(yScale.ticks(5));

  const xTicks = $derived(xTickValues.map(v => ({ value: NUM.format(v), x: xScale(v) })));
  const yTicks = $derived(yTickValues.map(v => ({ value: BRL.format(v), y: yScale(v) })));

  const xGridPositions = $derived(xTickValues.map(v => xScale(v)));
  const yGridPositions = $derived(yTickValues.map(v => yScale(v)));

  // ── Legend items ──────────────────────────────────────────────────────────

  const regionLegendItems = Object.entries(REGION_COLOR).map(([label, color]) => ({
    label,
    color,
  }));

  // ── Resize observer ───────────────────────────────────────────────────────

  onMount(() => {
    width = containerEl!.clientWidth;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(containerEl!);
    return () => ro.disconnect();
  });
</script>

<div bind:this={containerEl} class="chart-container">
  {#if width > 0}
    <svg {width} {height}>
      <g transform="translate({MARGIN.left},{MARGIN.top})">
        <!-- Grid lines -->
        <GridLines
          type="horizontal"
          positions={yGridPositions}
          length={innerW}
          color={black}
          dashed
        />
        <GridLines
          type="vertical"
          positions={xGridPositions}
          length={innerH}
          color={black}
          dashed
        />

        <!-- Bubbles -->
        {#each rows as d}
          {@const color = REGION_COLOR[UF_REGION[d.uf]] ?? '#a0a0a0'}
          {@const r = rScale(d.qtdFomentos)}
          <g
            transform="translate({xScale(d.popTotal)},{yScale(d.valorRecebido)})"
            style="cursor: pointer"
            role="img"
            aria-label={d.uf}
            onmouseenter={(e) => {
              tooltip = { visible: true, ...relativePos(e, containerEl!), html: buildTooltipHtml(d) };
            }}
            onmousemove={(e) => {
              tooltip = { ...tooltip, ...relativePos(e, containerEl!) };
            }}
            onmouseleave={() => { tooltip = { ...tooltip, visible: false }; }}
          >
            <circle
              {r}
              fill={color}
              opacity={0.75}
              stroke={color}
              stroke-width={1}
            />
            {#if r > 10}
              <text
                text-anchor="middle"
                dy="0.35em"
                font-size={9}
                font-weight={700}
                fill={getContrastColor(color)}
                pointer-events="none"
              >{d.uf.substring(0, 2).toUpperCase()}</text>
            {/if}
          </g>
        {/each}

        <!-- Axes with axis labels -->
        <XAxis
          ticks={xTicks}
          innerHeight={innerH}
          innerWidth={innerW}
          label="População total (escala log)"
          showLine={false}
          color="#555555"
          fontSize={10}
        />
        <YAxis
          ticks={yTicks}
          innerHeight={innerH}
          label="Valor recebido (escala log)"
          showLine={false}
          color="#555555"
          fontSize={10}
          labelOffset={56}
        />

        <!-- Region color legend (top-right of inner area) -->
        <g transform="translate({innerW - 140}, 8)">
          <Legend
            items={regionLegendItems}
            swatch="circle"
            direction="col"
            spacing={18}
            fontSize={10}
          />
        </g>
      </g>

      <!-- Bubble size footnote (absolute SVG position, below axes) -->
      <text
        x={MARGIN.left}
        y={height - 6}
        font-size={10}
        fill="#555555"
      >Tamanho da bolha = nº de projetos fomentados</text>
    </svg>

    <Tooltip {...tooltip} offsetX={12} offsetY={-28} />
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
