<script lang="ts">
  import { onMount } from 'svelte';
  import { geoMercator, geoPath } from 'd3';
  import { loadBrazilGeoJSON, loadStateGeoJSON } from '../utils/geoLoader.js';
  import { buildSharedColorScale, flattenTierData, SCALE_STOPS } from '../charts/tierSmallMultiples.js';
  import type { TierData } from '../charts/tierSmallMultiples.js';
  import { getContrastColor } from '../utils/colorContrast.js';
  import { colorScales } from '../tokens.js';

  interface Props {
    tiers?: Record<string, TierData>;
    metric?: string;
    format?: (v: number) => string;
  }

  let {
    tiers = {},
    metric = 'execucaoFinanceira',
    format = (v: number) => `${v.toFixed(1)}%`,
  }: Props = $props();

  // ── DOM dimensions (bind:clientWidth handles ResizeObserver internally) ───

  let brazilWidth = $state(0);
  let detailWidth = $state(0);

  // ── Async data ────────────────────────────────────────────────────────────

  let brazilGeo: any       = $state(null);
  let selectedFeature: any = $state(null);
  let stateGeo: any        = $state(null);
  let loadingState           = $state(false);

  // ── Data computations (reactive to tiers / metric) ────────────────────────

  const colorResult = $derived(buildSharedColorScale(tiers, metric));
  const flat        = $derived(flattenTierData(tiers, metric));

  // ── Brazil overview map ───────────────────────────────────────────────────

  const brazilHeight = $derived(brazilWidth * 0.88);

  const brazilProj = $derived(
    brazilGeo && brazilWidth > 0
      ? geoMercator().fitSize([brazilWidth, brazilHeight], brazilGeo)
      : null
  );
  const brazilPathGen = $derived(brazilProj ? geoPath().projection(brazilProj) : null);

  const brazilLabelSize = $derived(Math.max(6, brazilWidth * 0.013));

  // ── Legend ────────────────────────────────────────────────────────────────

  const legendW = $derived(Math.min(130, brazilWidth * 0.5));
  const legendGradId = 'tsm-legend-grad';

  // ── State detail map ──────────────────────────────────────────────────────

  const DETAIL_PADDING = 12;
  const detailHeight   = $derived(detailWidth * 1.1);

  const detailProj = $derived(
    stateGeo && detailWidth > 0 && detailHeight > 0
      ? geoMercator().fitSize(
          [detailWidth - DETAIL_PADDING * 2, detailHeight - DETAIL_PADDING * 2],
          stateGeo,
        )
      : null
  );
  const detailPathGen = $derived(detailProj ? geoPath().projection(detailProj) : null);

  const selectedVal  = $derived(selectedFeature ? (flat[selectedFeature.properties.name] ?? 0) : 0);
  const detailFill   = $derived(selectedVal > 0 ? colorResult.colorScale(selectedVal) : '#e8e0d8');

  const selectedSigla = $derived(selectedFeature?.properties?.sigla as string | undefined);

  // ── Interaction ───────────────────────────────────────────────────────────

  async function handleStateClick(feature: any) {
    if (selectedFeature?.properties?.sigla === feature.properties.sigla) {
      selectedFeature = null;
      stateGeo = null;
      return;
    }
    selectedFeature = feature;
    loadingState = true;
    stateGeo = await loadStateGeoJSON(feature.properties.sigla);
    loadingState = false;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  onMount(() => {
    loadBrazilGeoJSON().then((geo) => { brazilGeo = geo; });
  });
</script>

<div class="layout">

  <!-- ── Left: Brazil overview ──────────────────────────────────────────── -->
  <div class="panel brazil-panel">
    <div class="panel-header">
      <span class="panel-title">Brasil</span>
      <span class="panel-sub">Clique em um estado para explorar</span>
    </div>

    <div class="map-el" bind:clientWidth={brazilWidth}>
      <div class="map-center">
        {#if brazilGeo && brazilPathGen && brazilWidth > 0}
          <svg width={brazilWidth} height={brazilHeight} viewBox="0 0 {brazilWidth} {brazilHeight}">
            <!-- State polygons -->
            {#each brazilGeo.features as feature (feature.properties.sigla)}
              <path
                d={brazilPathGen(feature) ?? ''}
                fill={flat[feature.properties.name] > 0
                  ? colorResult.colorScale(flat[feature.properties.name])
                  : '#e8e0d8'}
                stroke={feature.properties.sigla === selectedSigla ? colorScales.purple[3] : '#c8c0b8'}
                stroke-width={feature.properties.sigla === selectedSigla ? 2 : 0.5}
                style="cursor: pointer"
                role="button"
                tabindex="0"
                aria-label={feature.properties.name}
                onclick={() => handleStateClick(feature)}
                onkeydown={(e) => e.key === 'Enter' && handleStateClick(feature)}
              />
            {/each}

            <!-- State abbreviation labels -->
            {#each brazilGeo.features as feature (feature.properties.sigla + '-label')}
              {@const [cx, cy] = brazilPathGen.centroid(feature)}
              {@const stateFill = flat[feature.properties.name] > 0
                ? colorResult.colorScale(flat[feature.properties.name])
                : '#e8e0d8'}
              <text
                x={cx} y={cy}
                text-anchor="middle"
                dominant-baseline="middle"
                font-size={brazilLabelSize}
                font-weight="600"
                fill={getContrastColor(stateFill)}
                pointer-events="none"
              >{feature.properties.sigla}</text>
            {/each}
          </svg>
        {/if}
      </div>

      <!-- Gradient legend -->
      <div class="legend">
        <svg width={legendW} height={24}>
          <defs>
            <linearGradient id={legendGradId} x1="0%" x2="100%">
              {#each SCALE_STOPS as color, i (i)}
                <stop offset="{(i / (SCALE_STOPS.length - 1)) * 100}%" stop-color={color} />
              {/each}
            </linearGradient>
          </defs>
          <rect width={legendW} height={6} rx={2} fill="url(#{legendGradId})" />
          <text x={0} y={18} font-size={9} fill="#8a6d84" text-anchor="start">{format(colorResult.sharedMin)}</text>
          <text x={legendW} y={18} font-size={9} fill="#8a6d84" text-anchor="end">{format(colorResult.sharedMax)}</text>
        </svg>
      </div>
    </div>
  </div>

  <!-- ── Right: State detail ────────────────────────────────────────────── -->
  <div class="panel detail-panel">
    <div class="panel-header">
      {#if selectedFeature}
        <span class="panel-title">
          {selectedFeature.properties.name}
          <span class="sigla">({selectedFeature.properties.sigla})</span>
        </span>
        <span class="panel-sub">{format(selectedVal)}</span>
      {:else}
        <span class="panel-title">—</span>
        <span class="panel-sub">&nbsp;</span>
      {/if}
    </div>

    <div class="map-wrapper" bind:clientWidth={detailWidth}>
      {#if stateGeo && detailPathGen && !loadingState && detailWidth > 0 && detailHeight > 0}
        <svg width={detailWidth} height={detailHeight} viewBox="0 0 {detailWidth} {detailHeight}">
          <g transform="translate({DETAIL_PADDING},{DETAIL_PADDING})">
            {#each stateGeo.features as feature (feature.properties?.codarea ?? feature.properties?.id ?? feature.properties?.name)}
              <path
                d={detailPathGen(feature) ?? ''}
                fill={detailFill}
                stroke="#ffffdeff"
                stroke-opacity="0.3"
                stroke-width={0.5}
              />
            {/each}
          </g>
        </svg>
      {/if}

      {#if !selectedFeature}
        <div class="overlay">← Selecione um estado no mapa</div>
      {:else if loadingState}
        <div class="overlay">Carregando...</div>
      {/if}
    </div>
  </div>

</div>

<style>
  .layout {
    display: flex;
    gap: 16px;
    width: 100%;
  }

  .panel {
    background: #ffffdeff;
    border: 1px solid #e8e0d8;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .brazil-panel {
    flex: 0 0 44%;
  }

  .detail-panel {
    flex: 1;
  }

  .panel-header {
    padding: 10px 12px 6px;
    border-bottom: 1px solid #e8e0d8;
    flex-shrink: 0;
  }

  .panel-title {
    display: block;
    font-size: 0.82rem;
    font-weight: 700;
    color: #2f0f29;
  }

  .sigla {
    font-weight: 400;
    color: #8a6d84;
  }

  .panel-sub {
    font-size: 0.72rem;
    color: #8a6d84;
  }

  .map-wrapper {
    position: relative;
    flex: 1;
    aspect-ratio: 10 / 11;
    min-height: 160px;
  }

  .map-el {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 12px 0;
  }

  .map-center {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .legend {
    display: flex;
    justify-content: center;
  }

  :global(.map-el svg),
  :global(.map-wrapper svg) {
    display: block;
    width: 100%;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ffffdeff;
    font-size: 0.78rem;
    color: #8a6d84;
  }

  @media (max-width: 640px) {
    .layout {
      flex-direction: column;
    }
    .brazil-panel {
      flex: unset;
    }
  }
</style>
