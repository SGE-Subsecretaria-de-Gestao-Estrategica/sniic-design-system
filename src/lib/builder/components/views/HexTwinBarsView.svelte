<script lang="ts">
  import HexTwinBars from "$lib/core/components/hexMap/HexTwinBars.svelte";
  import Legend from "$lib/core/components/legend/Legend.svelte";
  import {
    fontSize,
    fontWeight,
    spacing,
    strokeWidth,
  } from "$lib/core/theme/tokens";
  import type { LegendItem } from "$lib/types/Legend";
  import type { ChartLayouts } from "../../registry/layouts";
  import { readText, readToggle } from "../../registry/options";
  import type { ViewProps } from "./types";

  let {
    layout,
    id,
    margin,
    theme,
    formatValue,
    options,
  }: ViewProps<ChartLayouts["hexTwinBars"]> = $props();

  // As in G6.09: the first type in the secondary colour, the other in the primary.
  const typeColor = (typeIndex: number) =>
    typeIndex === 0 ? theme.palette.secondary : theme.palette.primary;
  const thresholdStroke = $derived(theme.palette.neutral[300]);

  const legend = $derived.by((): LegendItem[] => {
    if (!readToggle(options, "legend")) return [];
    const items: LegendItem[] = layout.types.map((label, i) => ({
      label,
      color: typeColor(i),
    }));
    const thresholdName = readText(options, "thresholdName");
    if (thresholdName && layout.data.some((tile) => tile.threshold)) {
      items.push({
        label: thresholdName,
        color: thresholdStroke,
        shape: "line",
      });
    }
    return items;
  });
</script>

{#if legend.length}
  <Legend
    items={legend}
    direction="row"
    shape="rect"
    left={margin.left}
    top={spacing.sm}
  />
{/if}

<HexTwinBars
  {layout}
  {id}
  top={margin.top}
  left={margin.left}
  tileFill={theme.palette.base[100]}
  tileStroke={theme.palette.base[300]}
  tileStrokeWidth={strokeWidth.sm}
  barFill={(bar) => typeColor(bar.typeIndex)}
  overflowFill={readToggle(options, "accentOver")
    ? theme.palette.accent
    : undefined}
  {thresholdStroke}
  thresholdStrokeWidth={strokeWidth.sm}
  formatValue={(bar) => formatValue(bar.value)}
  valueFill={theme.palette.neutral[100]}
  valueFontSize={fontSize.xs}
  valueFontWeight={fontWeight.regular}
  nameFill={theme.palette.neutral[200]}
  nameFontSize={fontSize.sm}
  nameFontWeight={fontWeight.medium}
/>
