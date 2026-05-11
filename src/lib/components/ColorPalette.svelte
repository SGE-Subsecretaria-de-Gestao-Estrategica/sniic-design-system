<script lang="ts">
  import { colorScales } from '../tokens.js';
  import { getContrastColor } from '../utils/colorContrast.js';

  const stops = ['100', '300', '500', '700', '900'] as const;

  const scales = [
    { label: 'Blue',     hue: '212° → 228°', colors: colorScales.blue     },
    { label: 'Orange',   hue: '35° → 8°',    colors: colorScales.orange   },
    { label: 'Teal',     hue: '162° → 172°', colors: colorScales.teal     },
    { label: 'Yellow',   hue: '52° → 30°',   colors: colorScales.yellow   },
    { label: 'Purple',   hue: '312° → 303°', colors: colorScales.purple   },
    { label: 'Lime',     hue: '85° → 68°',   colors: colorScales.lime     },
    { label: 'Red',      hue: '12° → 354°',  colors: colorScales.red      },
    { label: 'Lavender', hue: '306° → 315°', colors: colorScales.lavender },
  ];

  // Midpoint (500) color + full stops — used for cross-color gradient matrix
  const baseColors = scales.map(s => ({ label: s.label, color: s.colors[2], colors: s.colors }));

  // Recommended cross-color pairings (order-insensitive)
  const recommendedPairsList = [
    { a: 'Blue',   b: 'Orange',   use: 'Primary vs. accent — default for two-series charts' },
    { a: 'Blue',   b: 'Purple',   use: 'Demographic splits — harmonious cool tones' },
    { a: 'Blue',   b: 'Teal',     use: 'Related cool datasets — subtle paired metrics' },
    { a: 'Teal',   b: 'Yellow',   use: 'Nature / environmental data — warm-cool complement' },
    { a: 'Lime',   b: 'Red',      use: 'Positive vs. negative — growth / decline' },
    { a: 'Purple', b: 'Yellow',   use: 'Categorical splits — high contrast warm-cool' },
    { a: 'Orange', b: 'Teal',     use: 'Two strongly distinct categories — vivid complement' },
    { a: 'Yellow', b: 'Lavender', use: 'Annotations over muted backgrounds — soft contrast' },
  ];

  const recommendedPairKeys = new Set(
    recommendedPairsList.map(p => [p.a, p.b].sort().join('|'))
  );

  function isRecommended(a: string, b: string): boolean {
    return a !== b && recommendedPairKeys.has([a, b].sort().join('|'));
  }

  function pairColor(label: string): string {
    return baseColors.find(c => c.label === label)!.color;
  }

  let {
    background = 'light',
    view = 'swatches',
  }: { background?: 'light' | 'dark'; view?: 'swatches' | 'gradients' | 'cross' } = $props();

  const isDark = $derived(background === 'dark');
</script>

<div class="palette" class:dark={isDark}>
  <header class="header">
    <h2 class="title">Color Scales</h2>
    <p class="subtitle">Hue-varied gradients — each scale shifts hue across stops for richer transitions.</p>
  </header>

  {#if view === 'cross'}
    <div class="cross-grid">
      <!-- Column headers -->
      <div class="cross-corner"></div>
      {#each baseColors as col (col.label)}
        <div class="cross-col-label">
          <div class="cross-dot" style="background: {col.color};"></div>
          <span>{col.label}</span>
        </div>
      {/each}

      {#each baseColors as row (row.label)}
        <div class="cross-row-label">
          <div class="cross-dot" style="background: {row.color};"></div>
          <span>{row.label}</span>
        </div>
        {#each baseColors as col (col.label)}
          <div
            class="cross-cell"
            class:recommended={isRecommended(row.label, col.label)}
            title="{row.label} → {col.label}"
            style={row.label === col.label
              ? `background: linear-gradient(to right, ${row.colors.join(', ')});`
              : `background: linear-gradient(to right, ${row.color}, ${col.color});`}
          ></div>
        {/each}
      {/each}
    </div>

    <!-- Recommended pairings list -->
    <div class="recommended-section">
      <h3 class="recommended-title">Recommended pairings</h3>
      <div class="recommended-list">
        {#each recommendedPairsList as pair (pair.a + pair.b)}
          <div class="recommended-pair">
            <div
              class="recommended-bar"
              style="background: linear-gradient(to right, {pairColor(pair.a)}, {pairColor(pair.b)});"
            ></div>
            <div class="recommended-meta">
              <span class="recommended-names">
                <span class="recommended-dot" style="background: {pairColor(pair.a)};"></span>
                {pair.a}
                <span class="recommended-arrow">→</span>
                <span class="recommended-dot" style="background: {pairColor(pair.b)};"></span>
                {pair.b}
              </span>
              <span class="recommended-use">{pair.use}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {:else if view === 'gradients'}
    <div class="gradient-list">
      {#each scales as scale (scale.label)}
        <div class="gradient-row">
          <div class="gradient-meta">
            <span class="scale-name">{scale.label}</span>
            <span class="scale-hue">{scale.hue}</span>
          </div>
          <div
            class="gradient-bar"
            style="background: linear-gradient(to right, {scale.colors.join(', ')});"
          ></div>
          <div class="gradient-caps">
            <span class="hex">{scale.colors[0]}</span>
            <span class="hex">{scale.colors[scale.colors.length - 1]}</span>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="scales">
      {#each scales as scale (scale.label)}
        <div class="scale">
          <div class="scale-header">
            <span class="scale-name">{scale.label}</span>
            <span class="scale-hue">{scale.hue}</span>
          </div>

          <div
            class="gradient-strip"
            style="background: linear-gradient(to right, {scale.colors.join(', ')});"
          ></div>

          <div class="swatches">
            {#each scale.colors as color, i (color)}
              <div class="swatch-col">
                <div class="swatch" style="background: {color};" title={color}>
                  <span class="swatch-overlay" style="color: {getContrastColor(color)}; opacity: 0.45;">
                    {stops[i]}
                  </span>
                </div>
                <span class="hex">{color}</span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .palette {
    font-family: 'Inter', system-ui, sans-serif;
    padding: 40px;
    background: #f0f0f0;
    min-height: 100vh;
    transition: background 0.2s;
  }

  .palette.dark {
    background: #1b1b1b;
  }

  .header {
    margin-bottom: 36px;
  }

  .title {
    margin: 0 0 6px;
    font-size: 20px;
    font-weight: 700;
    color: #1b1b1b;
  }

  .dark .title {
    color: #f0f0f0;
  }

  .subtitle {
    margin: 0;
    font-size: 13px;
    color: #71767a;
  }

  /* Swatches view */
  .scales {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }

  @media (max-width: 720px) {
    .scales { grid-template-columns: 1fr; }
  }

  .scale {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .scale-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .scale-name {
    font-size: 12px;
    font-weight: 700;
    color: #2d2e2f;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .dark .scale-name {
    color: #dfe1e2;
  }

  .scale-hue {
    font-size: 10px;
    color: #a9aeb1;
    font-variant-numeric: tabular-nums;
  }

  .gradient-strip {
    height: 10px;
    border-radius: 99px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }

  .swatches {
    display: flex;
    gap: 4px;
  }

  .swatch-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .swatch {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    transition: transform 0.1s;
  }

  .swatch:hover {
    transform: scale(1.08);
  }

  .swatch-overlay {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.03em;
    user-select: none;
  }

  /* Cross-color gradient matrix */
  .cross-grid {
    display: grid;
    grid-template-columns: 72px repeat(8, 1fr);
    gap: 4px;
  }

  .cross-corner {
    /* empty top-left cell */
  }

  .cross-col-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    font-weight: 700;
    color: #71767a;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    text-align: center;
  }

  .dark .cross-col-label {
    color: #a9aeb1;
  }

  .cross-row-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    font-weight: 700;
    color: #71767a;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
  }

  .dark .cross-row-label {
    color: #a9aeb1;
  }

  .cross-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .cross-cell {
    height: 36px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
    outline: 2px solid transparent;
    outline-offset: 1px;
    transition: outline-color 0.1s;
  }

  .cross-cell.recommended {
    outline-color: #f6c341;
    box-shadow: 0 0 0 1px rgba(246, 195, 65, 0.4), 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  /* Recommended pairings section */
  .recommended-section {
    margin-top: 32px;
  }

  .recommended-title {
    margin: 0 0 14px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: #2d2e2f;
  }

  .dark .recommended-title {
    color: #dfe1e2;
  }

  .recommended-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  @media (max-width: 720px) {
    .recommended-list { grid-template-columns: 1fr; }
  }

  .recommended-pair {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .recommended-bar {
    height: 28px;
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
    outline: 2px solid #f6c341;
    outline-offset: 1px;
  }

  .recommended-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .recommended-names {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 10px;
    font-weight: 700;
    color: #2d2e2f;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .dark .recommended-names {
    color: #dfe1e2;
  }

  .recommended-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .recommended-arrow {
    color: #a9aeb1;
    font-weight: 400;
  }

  .recommended-use {
    font-size: 10px;
    color: #71767a;
    line-height: 1.4;
  }

  .hex {
    font-size: 8px;
    color: #a9aeb1;
    font-family: monospace;
    text-align: center;
  }

  /* Gradients view */
  .gradient-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .gradient-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .gradient-meta {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .gradient-bar {
    height: 48px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .gradient-caps {
    display: flex;
    justify-content: space-between;
  }
</style>
