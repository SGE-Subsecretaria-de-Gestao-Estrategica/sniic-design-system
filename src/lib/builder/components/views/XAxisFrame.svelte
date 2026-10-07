<script lang="ts">
  import type { Snippet } from "svelte";
  import Axis from "$lib/core/components/axis/Axis.svelte";
  import GridColumns from "$lib/core/components/grid/GridColumns.svelte";
  import type { SegmentedAxis } from "$lib/core/layouts/segmentedAxis";
  import type { XValue } from "$lib/core/layouts/types";
  import { tickLabeller } from "./lines";

  type Props = {
    axis: SegmentedAxis;
    /** The stacked panels sharing the axis: gridlines are drawn in each, the axis under the last. */
    panels: readonly { top: number; height: number }[];
    children: Snippet;
  };

  let { axis, panels, children }: Props = $props();

  const bottom = $derived(Math.max(...panels.map((p) => p.top + p.height)));
  const labelTick = $derived(
    tickLabeller(axis.segments.flatMap((segment) => segment.ticks)),
  );
</script>

{#each axis.segments as segment (segment.index)}
  {#each panels as panel (panel.top)}
    <GridColumns
      scale={segment.scale}
      tickValues={segment.ticks}
      top={panel.top}
      height={panel.height}
    />
  {/each}
{/each}

{@render children()}

{#each axis.segments as segment (segment.index)}
  <Axis
    orientation="bottom"
    scale={segment.scale}
    tickValues={segment.ticks}
    top={bottom}
    tickFormat={(value) => labelTick(value as XValue)}
  />
{/each}
