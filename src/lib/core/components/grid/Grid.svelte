<script lang="ts" generics="XScale extends GridScale, YScale extends GridScale">
  import type { GridProps, GridScale } from "$lib/types/Grid";
  import Group from "../Group.svelte";
  import GridColumns from "./GridColumns.svelte";
  import GridRows from "./GridRows.svelte";

  let {
    top = 0,
    left = 0,
    xScale,
    yScale,
    width,
    height,
    rows = true,
    columns = true,
    numTicksRows,
    numTicksColumns,
    xTickValues,
    yTickValues,
    xOffset,
    yOffset,
    stroke,
    strokeWidth,
    strokeDasharray,
    rowLineProps,
    columnLineProps,
    className,
  }: GridProps<XScale, YScale> = $props();

  let shared = $derived({ stroke, strokeWidth, strokeDasharray });
</script>

<Group class={["grid", className]} {top} {left}>
  {#if rows}
    <GridRows
      scale={yScale}
      {width}
      numTicks={numTicksRows}
      tickValues={yTickValues}
      offset={yOffset}
      {...shared}
      {...rowLineProps}
    />
  {/if}

  {#if columns}
    <GridColumns
      scale={xScale}
      {height}
      numTicks={numTicksColumns}
      tickValues={xTickValues}
      offset={xOffset}
      {...shared}
      {...columnLineProps}
    />
  {/if}
</Group>
