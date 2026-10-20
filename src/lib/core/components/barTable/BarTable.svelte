<script lang="ts" generics="D">
  import type { BarTableProps } from "$lib/types/BarTable";
  import resolveValue from "$lib/core/utils/resolveValue";
  import Group from "../Group.svelte";
  import Text from "../Text.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import CapsuleBar from "../shape/CapsuleBar.svelte";
  import Line from "../shape/Line.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    barFill,
    dotFill,
    rowOpacity = () => 1,
    showBaselines = true,
    baselineStroke,
    baselineStrokeWidth,
    showHeaders = true,
    showValues = true,
    showCategories = true,
    formatHeader = (column) => column.key,
    formatValue = (bar) => String(bar.value),
    formatCategory = (category) => category,
    missingLabel = "não informado",
    labelFill,
    fontSize,
    fontWeight,
  }: BarTableProps<D> = $props();

  const labelStyle = $derived({ fill: labelFill, fontSize, fontWeight });
  const opacityOf = $derived(new Map(layout.rows.map((row) => [row.key, rowOpacity(row)])));
</script>

<Group class={["bar-table", className]} {top} {left}>
  {#if showCategories}
    <Group class="bar-table__categories">
      {#each layout.rows as row (row.key)}
        <g opacity={opacityOf.get(row.key)}>
          <PlacedLabel
            variant="categoryLabel"
            placement={row.label}
            text={formatCategory(row.category)}
            {...labelStyle}
          />
        </g>
      {/each}
    </Group>
  {/if}

  {#each layout.columns as column (column.key)}
    <Group class="bar-table__column" left={column.x}>
      {#if showHeaders}
        <PlacedLabel
          variant="columnHeader"
          placement={column.header}
          text={formatHeader(column)}
          width={column.width}
        />
      {/if}

      {#if showBaselines}
        <Line
          role="baseline"
          from={column.baseline.from}
          to={column.baseline.to}
          stroke={baselineStroke}
          strokeWidth={baselineStrokeWidth}
        />
      {/if}

      {#each column.bars as bar (bar.key)}
        <g class="bar-table__cell" opacity={opacityOf.get(bar.key)}>
          <CapsuleBar
            {...bar.rect}
            fill={resolveValue(barFill, bar, column)}
            dotFill={resolveValue(dotFill, bar, column)}
          />
          {#if showValues}
            <g class="bar-table__value">
              <PlacedLabel
                variant="valueLabel"
                placement={bar.valueLabel}
                text={formatValue(bar, column)}
                {...labelStyle}
              />
            </g>
          {/if}
        </g>
      {/each}

      {#if missingLabel}
        {#each column.missing as cell (cell.key)}
          <g opacity={opacityOf.get(cell.key)}>
            <Text
              variant="caption"
              dx={cell.label.x}
              dy={cell.label.y}
              textAnchor={cell.label.textAnchor}
              verticalAnchor={cell.label.verticalAnchor}
              text={missingLabel}
              font-style="italic"
            />
          </g>
        {/each}
      {/if}
    </Group>
  {/each}
</Group>
