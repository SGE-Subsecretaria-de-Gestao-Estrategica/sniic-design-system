<script lang="ts">
  import { formatLocale } from "$lib/core/format";
  import type { ChartResolution } from "../../resolve/types";
  import type { StyleSpec } from "../../spec/types";
  import ChartView from "../ChartView.svelte";
  import ExportChart from "../export/ExportChart.svelte";
  import "../ui/tokens.css";
  import { describeOverflow, measureOverflow, type Overflow } from "./overflow";

  type Props = {
    resolution: ChartResolution;
    style: StyleSpec;
    id: string;
    /** The CSV's name, for the exported files. */
    fileName: string | null;
  };

  let { resolution, style, id, fileName }: Props = $props();

  const formatCount = formatLocale.format(",");

  let holder = $state<HTMLDivElement>();
  let overflow = $state<Overflow | null>(null);

  // Measured after each redraw, and again once the font has loaded (it changes text widths).
  $effect(() => {
    void resolution;
    void style;
    const svg = holder?.querySelector("svg");
    if (!svg) {
      overflow = null;
      return;
    }
    const measure = () => (overflow = measureOverflow(svg));
    const frame = requestAnimationFrame(measure);
    document.fonts?.ready.then(measure);
    return () => cancelAnimationFrame(frame);
  });

  const overflowNote = $derived(describeOverflow(overflow));
</script>

<figure class="chart-preview">
  {#if resolution.status === "ready"}
    <div
      class="holder"
      bind:this={holder}
      style:padding-left="{Math.ceil(overflow?.left ?? 0)}px"
      style:padding-top="{Math.ceil(overflow?.top ?? 0)}px"
    >
      <ChartView chart={resolution} {id} {style} />
    </div>
    {#if overflowNote}
      <figcaption class="warning" role="status">{overflowNote}</figcaption>
    {/if}
    {#each resolution.warnings as warning (warning)}
      <figcaption class="warning">{warning}</figcaption>
    {/each}
    {#if resolution.dropped}
      <figcaption>
        {formatCount(resolution.dropped)}
        {resolution.dropped === 1 ? "linha ignorada" : "linhas ignoradas"} por valores
        ausentes.
      </figcaption>
    {/if}
    <ExportChart
      svg={() => holder?.querySelector<SVGSVGElement>(":scope > svg")}
      {fileName}
    />
  {:else if resolution.status === "incomplete"}
    <p>
      Escolha uma coluna para: {resolution.missing
        .map((c) => c.label)
        .join(", ")}.
    </p>
  {:else if resolution.status === "error"}
    <p class="error" role="alert">{resolution.message}</p>
  {:else}
    <p>
      {resolution.reason === "no-data"
        ? "Carregue um arquivo CSV."
        : "Escolha um gráfico."}
    </p>
  {/if}
</figure>

<style>
  .chart-preview {
    position: sticky;
    top: 16px;
    margin: 0;
    padding: 20px;
    overflow: auto;
    font-family: var(--builder-font);
    border: 1px solid var(--builder-line);
    border-radius: var(--builder-radius);
  }
  .holder {
    width: max-content;
  }
  /* The dashed frame is the figure's exact size. It belongs to the preview, not to the SVG. */
  .holder > :global(svg) {
    display: block;
    outline: 1px dashed var(--builder-line);
  }
  figcaption,
  p {
    margin: 8px 0 0;
    color: var(--builder-muted);
    font-size: var(--builder-text-sm);
  }
  .warning {
    color: var(--builder-warning);
  }
  .error {
    color: var(--builder-danger);
  }
</style>
