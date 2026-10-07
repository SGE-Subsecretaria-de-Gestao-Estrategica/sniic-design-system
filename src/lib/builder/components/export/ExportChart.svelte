<script lang="ts">
  import { download } from "../../export/download";
  import { exportName } from "../../export/names";
  import { pngBlob } from "../../export/png";
  import { svgMarkup } from "../../export/svg";
  import Button from "../ui/Button.svelte";

  type Props = {
    /** The chart on screen. */
    svg: () => SVGSVGElement | null | undefined;
    /** The CSV's name: the exported files are named after it. */
    fileName: string | null;
  };

  let { svg, fileName }: Props = $props();

  const PNG_SCALES = [1, 2];

  let busy = $state(false);
  let error = $state<string | null>(null);

  function saveSvg() {
    const chart = svg();
    if (!chart) return;
    download(svgMarkup(chart), exportName(fileName, "svg"), "image/svg+xml");
  }

  async function savePng(scale: number) {
    const chart = svg();
    if (!chart) return;
    busy = true;
    error = null;
    try {
      download(await pngBlob(chart, scale), exportName(fileName, "png", scale));
    } catch {
      error = "Não foi possível gerar o PNG.";
    } finally {
      busy = false;
    }
  }
</script>

<div class="export-chart">
  <span class="label">Baixar</span>
  <Button size="sm" onclick={saveSvg}>SVG</Button>
  {#each PNG_SCALES as scale (scale)}
    <Button size="sm" disabled={busy} onclick={() => savePng(scale)}>
      PNG {scale}×
    </Button>
  {/each}
  {#if error}
    <span class="error" role="alert">{error}</span>
  {/if}
</div>

<style>
  .export-chart {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
    margin-top: 16px;
    font-family: var(--builder-font);
    font-size: var(--builder-text-sm);
  }
  .label {
    color: var(--builder-muted);
  }
  .error {
    color: var(--builder-danger);
  }
</style>
