<script lang="ts" generics="D">
  import type { BubbleColumnsProps } from "$lib/types/BubbleColumns";
  import resolveValue from "$lib/core/utils/resolveValue";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import Circle from "../markers/Circle.svelte";
  import Line from "../shape/Line.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    fill,
    fillOpacity,
    showAxes = true,
    axisStroke,
    axisStrokeWidth,
    showValues = true,
    showGroupLabels,
    showCategoryLabels = true,
    formatValue = (item) => String(item.value),
    formatGroup = (group) => group,
    formatCategory = (category) => category,
    labelFill,
    fontSize,
    fontWeight,
  }: BubbleColumnsProps<D> = $props();

  const labelStyle = $derived({ fill: labelFill, fontSize, fontWeight });
  // A single implicit column has no group name to show.
  const groupLabels = $derived(showGroupLabels ?? layout.isGrouped);
</script>

<Group class={["bubble-columns", className]} {top} {left}>
  <Group top={layout.originY}>
    {#if showCategoryLabels}
      <Group class="bubble-columns__categories">
        {#each layout.rows as row (row.category)}
          <PlacedLabel
            variant="categoryLabel"
            placement={row.label}
            text={formatCategory(row.category)}
            {...labelStyle}
          />
        {/each}
      </Group>
    {/if}

    {#each layout.columns as column (column.group)}
      <Group class="bubble-columns__column">
        {#if groupLabels}
          <PlacedLabel
            variant="seriesLabel"
            placement={column.label}
            text={formatGroup(column.group)}
            {...labelStyle}
          />
        {/if}

        {#if showAxes}
          <Line
            role="baseline"
            from={{ x: column.x, y: layout.axis.top }}
            to={{ x: column.x, y: layout.axis.bottom }}
            stroke={axisStroke}
            strokeWidth={axisStrokeWidth}
          />
        {/if}

        {#each column.items as item (item.key)}
          <Circle
            x={column.x}
            y={item.y}
            size={item.radius}
            fill={resolveValue(fill, item, column)}
            fillOpacity={resolveValue(fillOpacity, item, column)}
          />
        {/each}

        {#if showValues}
          {#each column.items as item (item.key)}
            <PlacedLabel
              variant="valueLabel"
              placement={item.label}
              text={formatValue(item, column)}
              {...labelStyle}
            />
          {/each}
        {/if}
      </Group>
    {/each}
  </Group>
</Group>
