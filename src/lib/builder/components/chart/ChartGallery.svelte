<script lang="ts">
  import { chartCompatibility } from "../../registry/compatibility";
  import type { ColumnSchema } from "../../data/types";
  import type { ChartId } from "../../registry/layouts";
  import type { AnyChartDefinition } from "../../registry/types";
  import "../ui/tokens.css";

  type Props = {
    charts: readonly AnyChartDefinition[];
    columns: readonly ColumnSchema[];
    selected: ChartId | null;
    onselect: (chartId: ChartId) => void;
  };

  let { charts, columns, selected, onselect }: Props = $props();

  // Charts the data can feed come first; the rest say what is missing.
  const items = $derived(
    charts
      .map((chart) => ({
        chart,
        ...chartCompatibility(chart.channels, columns),
      }))
      .sort((a, b) => Number(b.compatible) - Number(a.compatible)),
  );
</script>

<ul class="chart-gallery">
  {#each items as { chart, compatible, reason } (chart.id)}
    <li>
      <button
        type="button"
        class:selected={chart.id === selected}
        aria-pressed={chart.id === selected}
        disabled={!compatible}
        onclick={() => onselect(chart.id as ChartId)}
      >
        <strong>{chart.label}</strong>
        <span>{chart.description}</span>
        {#if reason}
          <span class="reason">{reason}</span>
        {/if}
      </button>
    </li>
  {/each}
</ul>

<style>
  .chart-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    padding: 0;
    margin: 0;
    list-style: none;
    font-family: var(--builder-font);
  }
  button {
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 16px;
    color: var(--builder-ink);
    text-align: left;
    font: inherit;
    background: var(--builder-surface);
    border: 1px solid var(--builder-line);
    border-radius: var(--builder-radius);
    cursor: pointer;
  }
  button:hover:not(:disabled) {
    border-color: var(--builder-faint);
    background: var(--builder-wash);
  }
  button:focus-visible {
    outline: 2px solid var(--builder-ink-strong);
    outline-offset: 2px;
  }
  button:disabled {
    background: var(--builder-wash);
    border-color: var(--builder-line-soft);
    cursor: not-allowed;
  }
  button:disabled strong,
  button:disabled span {
    color: var(--builder-faint);
  }
  button:disabled .reason {
    color: var(--builder-warning);
  }
  /* The picked chart is the one filled card. */
  button.selected,
  button.selected:hover:not(:disabled) {
    color: var(--builder-surface);
    background: var(--builder-ink);
    border-color: var(--builder-ink);
  }
  button.selected span {
    color: var(--builder-line-soft);
  }
  strong {
    font-size: 15px;
    font-weight: 600;
  }
  span {
    color: var(--builder-muted);
    font-size: var(--builder-text-sm);
    line-height: 1.4;
  }
</style>
