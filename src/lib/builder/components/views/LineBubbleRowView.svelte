<script lang="ts">
  import * as d3 from "d3";
  import Group from "$lib/core/components/Group.svelte";
  import Text from "$lib/core/components/Text.svelte";
  import BubbleRow from "$lib/core/components/bubbleRow/BubbleRow.svelte";
  import LineSeries from "$lib/core/components/lineSeries/LineSeries.svelte";
  import { SINGLE_SERIES } from "$lib/core/layouts/lineSeries";
  import { spacing } from "$lib/core/theme/tokens";
  import type { ChartLayouts } from "../../registry/layouts";
  import { isPicked, readText, readToggle } from "../../registry/options";
  import { createFormatter } from "../../spec/format";
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
  }: ViewProps<ChartLayouts["lineBubbleRow"]> = $props();

  /** Where the bubbles' centres sit in their panel, from its top (0) to its bottom (1). */
  const ROW_CENTER_SHARE = 0.6;

  const { line, row, panels } = $derived(layout);
  const rowPanel = $derived(panels.byKey.row);
  const formatBubble = $derived(createFormatter(formats.bubbles));
  const caption = $derived(readText(options, "caption"));
  const endNote = $derived(readText(options, "endNote"));
  // Small to large values: primary → primaryVariant, or the other way round.
  const bubbleFill = $derived.by(() => {
    const { primary, primaryVariant } = theme.palette;
    return readToggle(options, "invertColors")
      ? d3.interpolateLab(primaryVariant, primary)
      : d3.interpolateLab(primary, primaryVariant);
  });
  // The bubbles follow the line's label option.
  const allValues = $derived(showsAllValues(options, "all"));
  const ends = $derived(segmentEndKeys(row.items, line.xAxis));
</script>

<Group top={margin.top} left={margin.left}>
  <XAxisFrame axis={line.xAxis} panels={panels.panels}>
    <LineSeries
      layout={line}
      markerSize={(point) => (point.isLast ? END_MARKER_SIZE : undefined)}
      markerFill={(point, series) =>
        point.isLast && isPicked(options, "accentEnd", series.key)
          ? theme.palette.accent
          : undefined}
      showValues={showsValue(options, "all")}
      formatValue={(point) => formatValue(point.yValue)}
      showNames={line.series[0]?.key !== SINGLE_SERIES}
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

    <BubbleRow
      layout={row}
      top={rowPanel.top + rowPanel.height * ROW_CENTER_SHARE - row.centerY}
      fill={(item) => bubbleFill(item.t)}
      baselineStroke={theme.palette.primary}
      showValues={(item) => allValues || ends.has(item.key)}
      formatValue={(item) =>
        item.isLast && endNote
          ? `${formatBubble(item.value)} ${endNote}`
          : formatBubble(item.value)}
      endLabelWidth={margin.right}
      labelFill={theme.palette.neutral[200]}
    />
  </XAxisFrame>
</Group>
