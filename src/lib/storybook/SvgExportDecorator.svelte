<script lang="ts">
  import { downloadSvg } from '../utils/exportSvg.js';

  let containerEl: HTMLDivElement | undefined = $state();

  function handleExport() {
    const svg = containerEl?.querySelector<SVGSVGElement>('svg');
    if (svg) downloadSvg(svg, 'chart.svg');
  }
</script>

<div bind:this={containerEl}>
  <slot />
</div>

<div class="export-bar">
  <button onclick={handleExport} class="export-btn">
    Export SVG
  </button>
</div>

<style>
  .export-bar {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
  }

  .export-btn {
    background: #1e3882;
    color: #fffffe;
    border: none;
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-family: system-ui, sans-serif;
    cursor: pointer;
    letter-spacing: 0.02em;
  }

  .export-btn:hover {
    background: #4271b5;
  }
</style>
