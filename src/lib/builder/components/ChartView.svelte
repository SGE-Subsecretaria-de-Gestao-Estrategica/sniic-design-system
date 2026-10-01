<script lang="ts">
  import Svg from "$lib/core/components/Svg.svelte";
  import Theme from "$lib/core/components/Theme.svelte";
  import HorizontalBars from "$lib/core/components/horizontalBars/HorizontalBars.svelte";
  import { formatCompactNumber } from "$lib/core/format";
  import { getPillarTheme } from "$lib/core/theme";
  import type { ChartLayoutView } from "../registry/layouts";
  import type { ReadyChart } from "../resolve/types";

  type Props = {
    chart: ReadyChart;
    id: string;
    pillar: number;
  };

  let { chart, id, pillar }: Props = $props();

  const theme = $derived(getPillarTheme(pillar));
  const palette = $derived(theme.palette);
  const view = $derived(chart.view);
  const { top, left } = $derived(chart.margin);

  function unhandled(chartId: never) {
    console.warn(
      `ChartView: no branch for chart "${chartId as ChartLayoutView["chart"]}".`,
    );
  }
</script>

{#key pillar}
  <Theme {theme}>
    <Svg
      width={chart.figure.width}
      height={chart.figure.height}
      style="overflow: visible;"
    >
      {#if view.chart === "horizontalBars"}
        <HorizontalBars
          layout={view.layout}
          {id}
          {top}
          {left}
          barFill={palette?.primary}
          markerFill={palette?.primaryVariant}
          formatValue={(bar) => formatCompactNumber(bar.value)}
        />
      {:else}
        {unhandled(view.chart)}
      {/if}
    </Svg>
  </Theme>
{/key}
