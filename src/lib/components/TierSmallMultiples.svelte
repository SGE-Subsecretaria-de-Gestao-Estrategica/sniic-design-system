<script lang="ts">
  import { onMount } from 'svelte';
  import { geoMercator, geoPath } from 'd3';
  import { loadBrazilGeoJSON, loadStateGeoJSON } from '../utils/geoLoader.js';
  import { buildSharedColorScale, flattenTierData, SCALE_STOPS } from '../charts/tierSmallMultiples.js';
  import type { TierData, CityMarker, MunicipalityData } from '../charts/tierSmallMultiples.js';
  import { getContrastColor } from '../utils/colorContrast.js';
  import { colorScales } from '../tokens.js';

  interface Props {
    tiers?: Record<string, TierData>;
    metric?: string;
    format?: (v: number) => string;
    cities?: CityMarker[];
    municipalities?: MunicipalityData;
  }

  let {
    tiers = {},
    metric = 'execucaoFinanceira',
    format = (v: number) => `${v.toFixed(1)}%`,
    cities = [],
    municipalities = {},
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

  const LABEL_MARGIN = 70;   // horizontal space reserved for labels on each side
  const DETAIL_PAD_Y = 12;
  const detailHeight = $derived(detailWidth * 1.3);
  const mapTop       = $derived(detailHeight * 0.1);  // space above map for labels
  const mapLeft      = $derived(LABEL_MARGIN);
  const mapWidth     = $derived(Math.max(0, detailWidth - LABEL_MARGIN * 2));
  const mapHeight    = $derived(Math.max(0, detailHeight * 0.8));  // 80% for map, 20% for labels above/below

  const detailProj = $derived(
    stateGeo && mapWidth > 0 && mapHeight > 0
      ? geoMercator().fitSize([mapWidth, mapHeight], stateGeo)
      : null
  );
  const detailPathGen = $derived(detailProj ? geoPath().projection(detailProj) : null);

  const selectedVal  = $derived(selectedFeature ? (flat[selectedFeature.properties.name] ?? 0) : 0);
  const detailFill   = $derived(selectedVal > 0 ? colorResult.colorScale(selectedVal) : '#e8e0d8');

  const selectedSigla = $derived(selectedFeature?.properties?.sigla as string | undefined);
  const selectedName  = $derived(selectedFeature?.properties?.name as string | undefined);

  // ── Municipality-level coloring ─────────────────────────────────────────

  const stateMuniData = $derived(selectedName ? (municipalities[selectedName] ?? {}) : {});
  const hasMuniData   = $derived(Object.keys(stateMuniData).length > 0);

  // ── City markers for the selected state ─────────────────────────────────

  const stateCities = $derived(
    selectedSigla
      ? cities.filter((c) => c.uf === selectedSigla)
      : [],
  );

  interface CityLayout {
    city: typeof cities[0];
    cx: number; cy: number;
    labelX: number; labelY: number;
    elbowX: number;
    anchor: string;
    isCapital: boolean;
  }

  const LINE_HEIGHT = 11;

  const cityLayouts = $derived.by((): CityLayout[] => {
    if (!detailProj || stateCities.length === 0 || mapWidth <= 0) return [];

    // Project all cities and split into left/right groups
    const projected = stateCities.map((city) => {
      const [cx, cy] = detailProj([city.lng, city.lat]) ?? [0, 0];
      const onRight = cx > mapWidth / 2;
      return { city, cx, cy, onRight, isCapital: city.tier === 'Capitais' };
    });

    const leftGroup = projected.filter((p) => !p.onRight).sort((a, b) => a.cy - b.cy);
    const rightGroup = projected.filter((p) => p.onRight).sort((a, b) => a.cy - b.cy);

    // Distribute labels vertically within each group, avoiding overlaps
    function distribute(group: typeof projected): CityLayout[] {
      if (group.length === 0) return [];
      const onRight = group[0].onRight;

      // Start with desired Y = marker Y, then push apart
      const slots = group.map((p) => ({ ...p, labelY: p.cy }));

      // Push overlapping labels apart (greedy top-down)
      for (let i = 1; i < slots.length; i++) {
        const minY = slots[i - 1].labelY + LINE_HEIGHT;
        if (slots[i].labelY < minY) {
          slots[i].labelY = minY;
        }
      }

      // If labels overflow below the available height, shift everything up
      const maxLabelY = detailHeight - mapTop - 4;
      const minLabelY = -mapTop + 6;
      if (slots.length > 0) {
        const overflow = slots[slots.length - 1].labelY - maxLabelY;
        if (overflow > 0) {
          for (const s of slots) s.labelY -= overflow;
        }
        // Clamp top
        if (slots[0].labelY < minLabelY) {
          const shift = minLabelY - slots[0].labelY;
          for (const s of slots) s.labelY += shift;
          // Re-distribute downward
          for (let i = 1; i < slots.length; i++) {
            const minY = slots[i - 1].labelY + LINE_HEIGHT;
            if (slots[i].labelY < minY) slots[i].labelY = minY;
          }
        }
      }

      return slots.map((s) => ({
        city: s.city,
        cx: s.cx,
        cy: s.cy,
        labelY: s.labelY,
        labelX: onRight ? mapWidth + 10 : -10,
        elbowX: onRight ? mapWidth + 2 : -2,
        anchor: onRight ? 'start' : 'end',
        isCapital: s.isCapital,
      }));
    }

    return [...distribute(leftGroup), ...distribute(rightGroup)];
  });

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
                stroke="#c8c0b8"
                stroke-width={0.5}
                style="cursor: pointer; outline: none;"
                role="button"
                tabindex="0"
                aria-label={feature.properties.name}
                onclick={() => handleStateClick(feature)}
                onkeydown={(e) => e.key === 'Enter' && handleStateClick(feature)}
              />
            {/each}

            <!-- Selected state highlight (rendered on top) -->
            {#if selectedSigla}
              {#each brazilGeo.features.filter((f) => f.properties.sigla === selectedSigla) as feature (feature.properties.sigla + '-sel')}
                <path
                  d={brazilPathGen(feature) ?? ''}
                  fill="none"
                  stroke={colorScales.purple[3]}
                  stroke-width={1.2}
                  pointer-events="none"
                />
              {/each}
            {/if}

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
      {#if stateGeo && detailPathGen && detailProj && !loadingState && detailWidth > 0 && detailHeight > 0}
        <svg width={detailWidth} height={detailHeight} viewBox="0 0 {detailWidth} {detailHeight}">
          <g transform="translate({mapLeft},{mapTop})">
            <!-- Municipality polygons -->
            {#each stateGeo.features as feature (feature.properties?.codarea ?? feature.properties?.id ?? feature.properties?.name)}
              {@const code = feature.properties?.codarea ?? ''}
              {@const muniVal = stateMuniData[code]}
              <path
                d={detailPathGen(feature) ?? ''}
                fill={hasMuniData && muniVal != null
                  ? colorResult.colorScale(muniVal)
                  : detailFill}
                stroke="#ffffdeff"
                stroke-opacity="0.3"
                stroke-width={0.5}
              />
            {/each}

            <!-- City markers + elbow leader lines -->
            {#each cityLayouts as cl (cl.city.name)}
              {@const sq = cl.isCapital ? 5 : 3.5}

              <!-- Leader line: marker → horizontal to edge → vertical to label Y → label -->
              <polyline
                points="{cl.cx},{cl.cy} {cl.elbowX},{cl.cy} {cl.elbowX},{cl.labelY} {cl.labelX},{cl.labelY}"
                fill="none"
                stroke="#8a6d84"
                stroke-width={0.7}
              />

              <!-- Square marker -->
              <rect
                x={cl.cx - sq} y={cl.cy - sq}
                width={sq * 2} height={sq * 2}
                fill="#fffffe"
                stroke={colorScales.purple[3]}
                stroke-width={1.2}
              />

              <!-- Label -->
              <text
                x={cl.labelX} y={cl.labelY}
                text-anchor={cl.anchor}
                dominant-baseline="middle"
                font-size={cl.isCapital ? 7.5 : 6.5}
                font-weight={cl.isCapital ? '700' : '400'}
                fill="#2f0f29"
                pointer-events="none"
              >{cl.city.name}</text>
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
    font-family: 'Space Grotesk', system-ui, sans-serif;
  }

  .panel {
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
    aspect-ratio: 10 / 13;
    min-height: 200px;
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
    font-family: 'Space Grotesk', system-ui, sans-serif;
  }

  :global(.map-el svg path[role='button']:focus),
  :global(.map-el svg path[role='button']:focus-visible) {
    outline: none;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
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
