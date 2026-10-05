<script lang="ts">
  import Group from "$lib/core/components/Group.svelte";
  import LineSeries from "$lib/core/components/lineSeries/LineSeries.svelte";
  import { SINGLE_SERIES } from "$lib/core/layouts/lineSeries";
  import { spacing } from "$lib/core/theme/tokens";
  import type { ChartLayouts } from "../../registry/layouts";
  import { isPicked, readText } from "../../registry/options";
  import { seriesColors } from "./colors";
  import { END_MARKER_SIZE, showsValue } from "./lines";
  import type { ViewProps } from "./types";
  import XAxisFrame from "./XAxisFrame.svelte";

  let {
    layout,
    margin,
    theme,
    formatValue,
    options,
  }: ViewProps<ChartLayouts["lineSeries"]> = $props();

  const highlight = $derived(readText(options, "highlight"));
  const colorsOf = (series: { key: string }) =>
    seriesColors(series.key === highlight, theme);
</script>

<Group top={margin.top} left={margin.left}>
  <XAxisFrame axis={layout.xAxis} panels={[{ top: 0, height: layout.height }]}>
    <LineSeries
      {layout}
      stroke={(series) => colorsOf(series).main}
      markerFill={(point, series) =>
        point.isLast && isPicked(options, "accentEnd", series.key)
          ? theme.palette.accent
          : colorsOf(series).variant}
      markerSize={(point) => (point.isLast ? END_MARKER_SIZE : undefined)}
      showValues={showsValue(options, "ends")}
      formatValue={(point) => formatValue(point.yValue)}
      showNames={layout.series[0]?.key !== SINGLE_SERIES}
      nameWidth={margin.right - spacing.md}
    />
  </XAxisFrame>
</Group>
