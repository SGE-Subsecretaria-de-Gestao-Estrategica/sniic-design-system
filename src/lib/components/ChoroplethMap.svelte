<script lang="ts">
  import { onMount } from 'svelte';
  import {
    geoMercator, geoPath,
    scaleSequential, scaleSqrt,
    max, interpolateRgbBasis,
  } from 'd3';
  import { black, white, red, amber, green, colorScales } from '../tokens.js';
  import { getContrastColor } from '../utils/colorContrast.js';
  import { loadBrazilGeoJSON } from '../utils/geoLoader.js';
  import { BRLFull } from '../utils/formatters.js';
  import type { ChoroplethCapital } from '../charts/choroplethMap.js';
  import GradientLegend from './atoms/GradientLegend.svelte';
  import BubbleWithLabel from './atoms/BubbleWithLabel.svelte';
  import Tooltip from './molecules/Tooltip.svelte';

  // Static — does not depend on any prop.
  const execColor = scaleSequential()
    .domain([80, 100])
    .interpolator(interpolateRgbBasis([red, amber, green]))
    .clamp(true);

  // ── Interaction helpers (pure functions) ──────────────────────────────────

  function relativePos(event: MouseEvent, el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function stateTooltipHtml(name: string, val: number): string {
    return `<strong>${name}</strong><br/>${label}: ${format(val)}`;
  }

  function capitalTooltipHtml(cap: ChoroplethCapital): string {
    return [
      `<strong>${cap.city}</strong> (${cap.uf})`,
      `Recebido: ${BRLFull.format(cap.valorRecebido)}`,
      `Execução: ${cap.execucaoFinanceira.toFixed(1)}%`,
      `Per capita: ${BRLFull.format(cap.valorPerCapita)}`,
      `Projetos: ${cap.qtdFomentos.toLocaleString('pt-BR')}`,
    ].join('<br/>');
  }

  // ── Props ─────────────────────────────────────────────────────────────────

  interface Props {
    states?: Record<string, any>;
    metric?: string;
    label?: string;
    format?: (v: number) => string;
    colorRange?: string[];
    activeState?: object | null;
    capitals?: ChoroplethCapital[];
    showCapitals?: boolean;
    isStatic?: boolean;
  }

  let {
    states = {},
    metric = 'execucaoFinanceira',
    label = '',
    format = (v) => v.toLocaleString('pt-BR'),
    colorRange = [...colorScales.blue],
    activeState = $bindable(null),
    capitals = [],
    showCapitals = false,
    isStatic = false,
  }: Props = $props();

  // ── State ─────────────────────────────────────────────────────────────────

  let containerEl: HTMLDivElement | undefined = $state();
  let width = $state(0);
  let geojson: any = $state(null);
  let hoveredStateName = $state<string | null>(null);
  let tooltip = $state({ visible: false, x: 0, y: 0, html: '' });

  // ── Reactive computations ─────────────────────────────────────────────────

  const height = $derived(Math.round(width * 0.7));

  const valueByName = $derived(
    new Map(
      Object.entries(states).map(([name, d]) => [name, (d[metric] as number) ?? 0])
    )
  );
  const values   = $derived([...valueByName.values()].filter(v => v > 0));
  const maxVal   = $derived(max(values) ?? 1);
  const legendW  = $derived(Math.min(180, width * 0.28));

  const colorScale = $derived(
    scaleSequential()
      .domain([0, maxVal])
      .interpolator(interpolateRgbBasis(colorRange))
  );

  // Geo — recomputed whenever width/height or geojson changes.
  const projection = $derived(
    geojson && width > 0
      ? geoMercator().fitSize([width, height], geojson)
      : null
  );
  const pathGen = $derived(projection ? geoPath().projection(projection) : null);

  // Capital bubble scale.
  const maxBubbleVal = $derived(
    capitals.length > 0 ? (max(capitals, c => c.valorRecebido) ?? 1) : 1
  );
  const bubbleR = $derived(scaleSqrt().domain([0, maxBubbleVal]).range([4, 22]));

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  onMount(async () => {
    width = containerEl!.clientWidth;
    const ro = new ResizeObserver(([e]) => { width = e.contentRect.width; });
    ro.observe(containerEl!);
    geojson = await loadBrazilGeoJSON();
    return () => ro.disconnect();
  });
</script>

<div bind:this={containerEl} class="choropleth-wrapper">
  {#if geojson && pathGen && projection && width > 0}
    <svg {width} {height} role="img" aria-label={label}>

      <!-- ── State polygons ─────────────────────────────────────────────── -->
      {#each geojson.features as feature (feature.properties.name)}
        {@const name    = feature.properties.name}
        {@const val     = valueByName.get(name) ?? 0}
        {@const hovered = hoveredStateName === name}
        <path
          d={pathGen(feature) ?? ''}
          fill={val > 0 ? colorScale(val) : black}
          stroke={hovered ? white : black}
          stroke-width={hovered ? 1.5 : 0.6}
          role={isStatic ? 'img' : 'button'}
          aria-label={name}
          style={isStatic ? undefined : 'cursor: pointer'}
          onmouseenter={isStatic ? undefined : (e) => {
            hoveredStateName = name;
            activeState = states[name] ?? null;
            if (val > 0) {
              tooltip = { visible: true, ...relativePos(e, containerEl!), html: stateTooltipHtml(name, val) };
            }
          }}
          onmousemove={isStatic ? undefined : (e) => { tooltip = { ...tooltip, ...relativePos(e, containerEl!) }; }}
          onmouseleave={isStatic ? undefined : () => {
            hoveredStateName = null;
            activeState = null;
            tooltip = { ...tooltip, visible: false };
          }}
        />
        {#if isStatic && val > 0}
          {@const [cx, cy] = pathGen.centroid(feature)}
          {@const stateFill = colorScale(val)}
          <text
            x={cx} y={cy}
            text-anchor="middle"
            font-size={9}
            font-family="'Space Grotesk', system-ui, sans-serif"
            fill={getContrastColor(stateFill)}
            pointer-events="none"
          >
            <tspan x={cx} dy="-0.4em" font-weight={700}>{feature.properties.sigla ?? name}</tspan>
            <tspan x={cx} dy="1.2em">{format(val)}</tspan>
          </text>
        {/if}
      {/each}

      <!-- ── Capital bubbles overlay ────────────────────────────────────── -->
      {#if showCapitals && capitals.length}
        {#each capitals as cap (cap.uf)}
          {@const pos = projection([cap.lng, cap.lat]) ?? [0, 0]}
          {@const r   = bubbleR(cap.valorRecebido)}
          <g
            transform="translate({pos[0]},{pos[1]})"
            role={isStatic ? 'img' : 'button'}
            aria-label={cap.city}
            style={isStatic ? undefined : 'cursor: pointer'}
            onmouseenter={isStatic ? undefined : (e) => {
              tooltip = { visible: true, ...relativePos(e, containerEl!), html: capitalTooltipHtml(cap) };
            }}
            onmousemove={isStatic ? undefined : (e) => { tooltip = { ...tooltip, ...relativePos(e, containerEl!) }; }}
            onmouseleave={isStatic ? undefined : () => { tooltip = { ...tooltip, visible: false }; }}
          >
            <BubbleWithLabel
              {r}
              fill={execColor(cap.execucaoFinanceira)}
              opacity={0.85}
              label={cap.uf.substring(0, 2).toUpperCase()}
              labelFontSize={8}
              ringGap={3}
              ringStroke={execColor(cap.execucaoFinanceira)}
              ringStrokeWidth={1.5}
              ringOpacity={0.5}
            />
          </g>
        {/each}

        <!-- Bubble size + exec colour legend (bottom-right) -->
        <g transform="translate({width - 120},{height - 100})">
          <text x={0} y={-8} font-size={10} font-family="'Space Grotesk', system-ui, sans-serif" fill="#000000">Tamanho = valor recebido</text>
          {#each [0.25, 1] as frac, i (frac)}
            {@const bval = maxBubbleVal * frac}
            {@const br   = bubbleR(bval)}
            {@const cx   = 20 + i * 56}
            <circle {cx} cy={0} r={br} fill="none" stroke="#555555" stroke-width={1} />
            <text x={cx} y={br + 12} text-anchor="middle" font-size={10} font-family="'Space Grotesk', system-ui, sans-serif" fill="#000000">
              {BRLFull.format(bval)}
            </text>
          {/each}
          <text x={0} y={52} font-size={10} font-family="'Space Grotesk', system-ui, sans-serif" fill="#000000">Cor = execução (%)</text>
          {#each [['< 90%', '#d2301d'], ['~95%', '#ecb42d'], ['≥ 100%', '#4f8c4e']] as [lbl, clr], i (lbl)}
            <g transform="translate(0,{60 + i * 16})">
              <circle r={4} cx={4} fill={clr} opacity={0.85} />
              <text x={12} y={4} font-size={10} font-family="'Space Grotesk', system-ui, sans-serif" fill="#000000">{lbl}</text>
            </g>
          {/each}
        </g>
      {/if}

      <!-- ── Gradient colour legend (bottom-left) ───────────────────────── -->
      <g transform="translate(16,{height - 36})">
        <GradientLegend {colorRange} min={0} max={maxVal} {format} width={legendW} />
      </g>

    </svg>
  {/if}

  {#if !isStatic}
    <Tooltip {...tooltip} offsetX={12} offsetY={-28} />
  {/if}
</div>

<style>
  .choropleth-wrapper {
    position: relative;
    width: 100%;
  }
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
