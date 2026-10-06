<script lang="ts">
  import { chartCompatibility } from "../../registry/compatibility";
  import type { ColumnSchema } from "../../data/types";
  import { groupCharts } from "../../registry/groups";
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

  const uid = $props.id();

  const groups = $derived(
    groupCharts(
      charts.map((chart) => ({
        chart,
        ...chartCompatibility(chart.channels, columns),
      })),
    ),
  );
</script>

<ul class="chart-gallery">
  {#each groups as { group, items } (group.id)}
    <li class="group">
      <h3 id="{uid}-{group.id}">{group.label}</h3>
      <ul class="charts" aria-labelledby="{uid}-{group.id}">
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
              {#if reason}
                <span class="reason">{reason}</span>
              {/if}
            </button>
          </li>
        {/each}
      </ul>
    </li>
  {/each}
</ul>

<style>
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .chart-gallery {
    font-family: var(--builder-font);
  }
  .group {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 16px;
    align-items: start;
    padding: 16px 0;
    border-top: 1px solid var(--builder-line-soft);
  }
  .group:first-child {
    padding-top: 0;
    border-top: 0;
  }
  h3 {
    margin: 0;
    padding-top: 10px;
    color: var(--builder-ink-strong);
    font-size: var(--builder-text);
    font-weight: 600;
  }
  .charts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 220px));
    gap: 12px;
  }
  .charts > li {
    display: flex;
  }
  button {
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-sizing: border-box;
    width: 100%;
    padding: 10px 14px;
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
  button:disabled strong {
    color: var(--builder-faint);
  }
  button.selected,
  button.selected:hover:not(:disabled) {
    color: var(--builder-surface);
    background: var(--builder-ink);
    border-color: var(--builder-ink);
  }
  strong {
    font-size: var(--builder-text);
    font-weight: 600;
    line-height: 1.4;
  }
  .reason {
    color: var(--builder-warning);
    font-size: var(--builder-text-xs);
    line-height: 1.4;
  }

  @media (max-width: 720px) {
    .group {
      grid-template-columns: minmax(0, 1fr);
      gap: 8px;
    }
    h3 {
      padding-top: 0;
    }
    .charts {
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    }
  }
</style>
