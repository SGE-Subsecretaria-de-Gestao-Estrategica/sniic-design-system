<script lang="ts">
  import Svg from "$lib/core/components/Svg.svelte";
  import Theme from "$lib/core/components/Theme.svelte";
  import { getPillarTheme } from "$lib/core/theme";
  import type { ChartLayoutView } from "../registry/layouts";
  import { resolveFormat } from "../registry/params";
  import type { ReadyChart } from "../resolve/types";
  import { createFormatter } from "../spec/format";
  import type { StyleSpec } from "../spec/types";
  import BubbleColumnsView from "./views/BubbleColumnsView.svelte";
  import HorizontalBarsView from "./views/HorizontalBarsView.svelte";
  import LineBubbleRowView from "./views/LineBubbleRowView.svelte";
  import LineDifferenceView from "./views/LineDifferenceView.svelte";
  import LineSeriesView from "./views/LineSeriesView.svelte";
  import RangeRowsView from "./views/RangeRowsView.svelte";

  type Props = {
    chart: ReadyChart;
    id: string;
    /** What the look needs from the spec; the layout already used the rest. */
    style: Pick<StyleSpec, "pillar" | "format" | "formats" | "options">;
  };

  let { chart, id, style }: Props = $props();

  const pillar = $derived(style.pillar);
  const theme = $derived(getPillarTheme(pillar));
  const view = $derived(chart.view);
  const shared = $derived({
    id,
    theme,
    margin: chart.margin,
    formatValue: createFormatter(style.format),
    formats: Object.fromEntries(
      (chart.definition.formats ?? []).map((def) => [
        def.id,
        resolveFormat(def, style.formats[def.id]),
      ]),
    ),
    options: style.options,
  });

  // Typed `never`: a chart in `CHARTS` without a branch below fails the type check.
  function unhandled(view: never) {
    console.warn(
      `ChartView: no branch for chart "${(view as ChartLayoutView).chart}".`,
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
        <HorizontalBarsView layout={view.layout} {...shared} />
      {:else if view.chart === "lineSeries"}
        <LineSeriesView layout={view.layout} {...shared} />
      {:else if view.chart === "lineBubbleRow"}
        <LineBubbleRowView layout={view.layout} {...shared} />
      {:else if view.chart === "lineDifference"}
        <LineDifferenceView layout={view.layout} {...shared} />
      {:else if view.chart === "rangeRows"}
        <RangeRowsView layout={view.layout} {...shared} />
      {:else if view.chart === "bubbleColumns"}
        <BubbleColumnsView layout={view.layout} {...shared} />
      {:else}
        {unhandled(view)}
      {/if}
    </Svg>
  </Theme>
{/key}
