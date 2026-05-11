<script lang="ts">
  import { colorScales } from '../tokens.js';

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

  let {
    background = 'light',
    view = 'swatches',
  }: { background?: 'light' | 'dark'; view?: 'swatches' | 'gradients' } = $props();

  const isDark = $derived(background === 'dark');

  function isLight(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  }
</script>

<div class="palette" class:dark={isDark}>
  <header class="header">
    <h2 class="title">Color Scales</h2>
    <p class="subtitle">Hue-varied gradients — each scale shifts hue across stops for richer transitions.</p>
  </header>

  {#if view === 'gradients'}
    <div class="gradient-list">
      {#each scales as scale}
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
      {#each scales as scale}
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
            {#each scale.colors as color, i}
              <div class="swatch-col">
                <div class="swatch" style="background: {color};" title={color}>
                  <span class="swatch-overlay" class:light-text={!isLight(color)}>
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
    color: rgba(0, 0, 0, 0.4);
    letter-spacing: 0.03em;
    user-select: none;
  }

  .swatch-overlay.light-text {
    color: rgba(255, 255, 255, 0.5);
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
