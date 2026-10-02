<script lang="ts">
  import type { ChartId } from "../../registry/layouts";
  import type { AnyChartDefinition } from "../../registry/types";

  type Props = {
    charts: readonly AnyChartDefinition[];
    selected: ChartId | null;
    onselect: (chartId: ChartId) => void;
  };

  let { charts, selected, onselect }: Props = $props();
</script>

<ul class="chart-gallery">
  {#each charts as chart (chart.id)}
    <li>
      <button
        type="button"
        class:selected={chart.id === selected}
        aria-pressed={chart.id === selected}
        onclick={() => onselect(chart.id as ChartId)}
      >
        <strong>{chart.label}</strong>
        <span>{chart.description}</span>
      </button>
    </li>
  {/each}
</ul>

<style>
  .chart-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    padding: 0;
    margin: 0;
    list-style: none;
  }
  button {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
    height: 100%;
    padding: 16px;
    text-align: left;
    font: inherit;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    cursor: pointer;
  }
  button:hover {
    border-color: #999;
  }
  .selected {
    border: 2px solid #333;
    padding: 15px;
  }
  span {
    color: #555;
    font-size: 13px;
  }
</style>
