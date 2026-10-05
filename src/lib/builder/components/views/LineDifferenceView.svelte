<script lang="ts">
  import Group from "$lib/core/components/Group.svelte";
  import Text from "$lib/core/components/Text.svelte";
  import DifferenceStems from "$lib/core/components/differenceStems/DifferenceStems.svelte";
  import LineSeries from "$lib/core/components/lineSeries/LineSeries.svelte";
  import { fontSize, spacing } from "$lib/core/theme/tokens";
  import type { ChartLayouts } from "../../registry/layouts";
  import { isPicked, readText } from "../../registry/options";
  import { createFormatter } from "../../spec/format";
  import { seriesColors } from "./colors";
  import {
    END_MARKER_SIZE,
    segmentEndKeys,
    showsAllValues,
    showsValue,
  } from "./lines";
  import type { ViewProps } from "./types";
  import XAxisFrame from "./XAxisFrame.svelte";

  let {
    layout,
    margin,
    theme,
    formatValue,
    formats,
    options,
  }: ViewProps<ChartLayouts["lineDifference"]> = $props();

  const { line, diff, panels } = $derived(layout);
  const formatDifference = $derived(createFormatter(formats.difference));
  // The last label swaps the suffix for the longer note.
  const formatLast = $derived(
    createFormatter({ ...formats.difference, suffix: "" }),
  );
  const caption = $derived(readText(options, "caption"));
  const endNote = $derived(readText(options, "endNote"));

  // The stems follow the lines' label option.
  const allValues = $derived(showsAllValues(options, "all"));
  const ends = $derived(segmentEndKeys(diff.stems, line.xAxis));

  // The series the other is subtracted from is the one in highlight.
  const colorsOf = (series: { key: string }) =>
    seriesColors(series.key === layout.minuend, theme);
</script>

<Group top={margin.top} left={margin.left}>
  <XAxisFrame axis={line.xAxis} panels={panels.panels}>
    <LineSeries
      layout={line}
      stroke={(series) => colorsOf(series).main}
      markerFill={(point, series) =>
        point.isLast && isPicked(options, "accentEnd", series.key)
          ? theme.palette.accent
          : colorsOf(series).variant}
      markerSize={(point, series) =>
        point.isLast && isPicked(options, "accentEnd", series.key)
          ? END_MARKER_SIZE
          : undefined}
      showValues={showsValue(options, "all")}
      formatValue={(point) => formatValue(point.yValue)}
      endValueWidth={margin.right}
      nameWidth={margin.right - spacing.md}
    />

    {#if caption}
      <Text
        variant="caption"
        dx={-margin.left}
        dy={panels.gaps[0].cy}
        text={caption}
        verticalAnchor="middle"
      />
    {/if}

    <DifferenceStems
      layout={diff}
      top={panels.byKey.diff.top}
      showValues={(stem) => allValues || ends.has(stem.key)}
      formatValue={(stem) =>
        stem.isLast && endNote
          ? `${formatLast(stem.value)} ${endNote}`
          : formatDifference(stem.value)}
      endLabelWidth={margin.right - spacing.md}
      fontSize={fontSize.xs}
      labelFill={theme.palette.neutral[200]}
    />
  </XAxisFrame>
</Group>
