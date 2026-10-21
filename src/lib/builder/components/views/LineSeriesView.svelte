<script lang="ts">
  import Group from "$lib/core/components/Group.svelte";
  import PlacedLabel from "$lib/core/components/label/PlacedLabel.svelte";
  import LineSeries from "$lib/core/components/lineSeries/LineSeries.svelte";
  import { SINGLE_SERIES } from "$lib/core/layouts/lineSeries";
  import { fontWeight, spacing } from "$lib/core/theme/tokens";
  import type { ChartLayouts } from "../../registry/layouts";
  import { isPicked, readText } from "../../registry/options";
  import { chosenSeriesPairs, seriesColors } from "./colors";
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
  const chosen = $derived(chosenSeriesPairs(options.seriesColors, theme));
  // By name: the same series has the same colours in every panel. A chosen
  // colour paints the line; its markers take the far end of its pair.
  const colorsOf = (series: { name: string }) =>
    chosen.get(series.name) ?? seriesColors(series.name === highlight, theme);
</script>

<Group top={margin.top} left={margin.left}>
  <XAxisFrame axis={layout.xAxis} panels={layout.panels}>
    {#each layout.panels as panel (panel.key)}
      {#if panel.title}
        <PlacedLabel
          variant="seriesLabel"
          placement={panel.title}
          text={panel.key}
          width={layout.width}
          fontWeight={fontWeight.semibold}
        />
      {/if}
    {/each}

    <LineSeries
      {layout}
      stroke={(series) => colorsOf(series).main}
      markerFill={(point, series) =>
        point.isLast && isPicked(options, "accentEnd", series.name)
          ? theme.palette.accent
          : colorsOf(series).variant}
      markerSize={(point) => (point.isLast ? END_MARKER_SIZE : undefined)}
      showValues={showsValue(options, "ends")}
      formatValue={(point) => formatValue(point.yValue)}
      showNames={layout.series[0]?.name !== SINGLE_SERIES}
      nameWidth={margin.right - spacing.md}
    />
  </XAxisFrame>
</Group>
