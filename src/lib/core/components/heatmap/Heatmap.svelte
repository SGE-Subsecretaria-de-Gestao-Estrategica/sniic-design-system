<script lang="ts" generics="D">
  import type { HeatmapCell } from "$lib/core/layouts/heatmap";
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { HeatmapProps } from "$lib/types/Heatmap";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    stepColors,
    cellFill,
    emptyFill,
    cellRadius,
    cellStroke,
    cellStrokeWidth,
    showValues = true,
    formatValue = (cell) => String(cell.value),
    valueFill,
    showRows = true,
    showColumns = true,
    formatRow = (row) => row.key,
    formatColumn = (column) => column.key,
    rowLabelWidth,
    labelFill,
    fontSize,
    fontWeight,
  }: HeatmapProps<D> = $props();

  const labelStyle = $derived({ fill: labelFill, fontSize, fontWeight });

  const fillOf = (cell: HeatmapCell<D>) =>
    cell.step === null
      ? emptyFill
      : (resolveValue(cellFill, cell) ?? stepColors[cell.step]);
</script>

<Group class={["heatmap", className]} {top} {left}>
  {#each layout.cells as cell (cell.key)}
    <rect
      x={cell.x}
      y={cell.y}
      width={cell.width}
      height={cell.height}
      rx={cellRadius}
      fill={fillOf(cell)}
      stroke={cellStroke}
      stroke-width={cellStrokeWidth}
    />
  {/each}

  {#each layout.cells as cell (cell.key)}
    {#if cell.value !== null && resolveValue(showValues, cell)}
      <PlacedLabel
        variant="valueLabel"
        placement={cell.label}
        text={formatValue(cell)}
        {...labelStyle}
        fill={resolveValue(valueFill, cell) ?? labelFill}
      />
    {/if}
  {/each}

  {#if showRows}
    {#each layout.rows as row (row.key)}
      <PlacedLabel
        variant="categoryLabel"
        placement={row.label}
        text={formatRow(row)}
        width={rowLabelWidth}
        {...labelStyle}
      />
    {/each}
  {/if}

  {#if showColumns}
    {#each layout.columns as column (column.key)}
      <PlacedLabel
        variant="tickLabel"
        placement={column.label}
        text={formatColumn(column)}
        {...labelStyle}
      />
    {/each}
  {/if}
</Group>
