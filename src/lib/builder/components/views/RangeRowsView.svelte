<script lang="ts">
  import LinearGradient from "$lib/core/components/gradient/LinearGradient.svelte";
  import Legend from "$lib/core/components/legend/Legend.svelte";
  import RangeRows from "$lib/core/components/rangeRows/RangeRows.svelte";
  import { spacing } from "$lib/core/theme/tokens";
  import type { ChartLayouts } from "../../registry/layouts";
  import { groupColor } from "./colors";
  import type { ViewProps } from "./types";

  let {
    layout,
    id,
    margin,
    theme,
    formatValue,
  }: ViewProps<ChartLayouts["rangeRows"]> = $props();

  const colorOf = (group: string) =>
    groupColor(layout.groups.indexOf(group), theme);

  // The strap runs towards the leading group: the first group one way, the others the other way.
  const strapStops = $derived(
    layout.groups.map((group, i) => {
      const { primary, primaryVariant } = theme.palette;
      return i === 0
        ? { group, from: primary, to: primaryVariant }
        : { group, from: primaryVariant, to: primary };
    }),
  );
  const strapId = (group: string) =>
    `${id}-strap-${layout.groups.indexOf(group)}`;
</script>

<defs>
  {#each strapStops as stops (stops.group)}
    <LinearGradient
      id={strapId(stops.group)}
      from={stops.from}
      to={stops.to}
      vertical={false}
      x1="10%"
      x2="90%"
    />
  {/each}
</defs>

<Legend
  items={layout.groups.map((label) => ({ label, color: colorOf(label) }))}
  direction="row"
  shape="circle"
  left={margin.left}
  top={spacing.lg}
/>

<RangeRows
  {layout}
  top={margin.top}
  left={margin.left}
  strapFill={(row) => `url(#${strapId(row.leader)})`}
  markerFill={(marker) => colorOf(marker.group)}
  formatValue={(marker) => formatValue(marker.value)}
/>
