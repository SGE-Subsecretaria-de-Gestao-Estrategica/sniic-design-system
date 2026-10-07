<script lang="ts" generics="D">
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { RangeRowsProps } from "$lib/types/RangeRows";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import Circle from "../markers/Circle.svelte";
  import Line from "../shape/Line.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    showGridlines = true,
    gridlineStroke,
    gridlineStrokeWidth,
    showStraps = true,
    strapFill,
    strapOpacity,
    showMarkers = true,
    markerFill,
    showValues = true,
    showCategories = true,
    formatValue = (marker) => String(marker.value),
    formatCategory = (category) => category,
    labelFill,
    fontSize,
    fontWeight,
  }: RangeRowsProps<D> = $props();

  const labelStyle = $derived({ fill: labelFill, fontSize, fontWeight });
</script>

<Group class={["range-rows", className]} {top} {left}>
  {#if showGridlines}
    <Group class="range-rows__gridlines">
      {#each layout.rows as row (row.key)}
        <Line
          role="baseline"
          from={row.gridline.from}
          to={row.gridline.to}
          stroke={gridlineStroke}
          strokeWidth={gridlineStrokeWidth}
        />
      {/each}
    </Group>
  {/if}

  {#if showStraps}
    <Group class="range-rows__straps">
      {#each layout.rows as row (row.key)}
        <rect
          x={row.strap.x}
          y={row.strap.y}
          width={row.strap.width}
          height={row.strap.height}
          fill={resolveValue(strapFill, row)}
          fill-opacity={resolveValue(strapOpacity, row)}
        />
      {/each}
    </Group>
  {/if}

  {#if showMarkers}
    <Group class="range-rows__markers">
      {#each layout.rows as row (row.key)}
        {#each row.markers as marker (marker.key)}
          <Circle
            x={marker.x}
            y={marker.y}
            size={marker.radius}
            fill={resolveValue(markerFill, marker, row)}
          />
        {/each}
      {/each}
    </Group>
  {/if}

  <Group class="range-rows__values">
    {#each layout.rows as row (row.key)}
      {#each row.markers as marker (marker.key)}
        {#if resolveValue(showValues, marker, row)}
          <PlacedLabel
            variant="valueLabel"
            placement={marker.label}
            text={formatValue(marker, row)}
            {...labelStyle}
          />
        {/if}
      {/each}
    {/each}
  </Group>

  {#if showCategories}
    <Group class="range-rows__categories">
      {#each layout.rows as row (row.key)}
        <PlacedLabel
          variant="categoryLabel"
          placement={row.label}
          text={formatCategory(row.category)}
          {...labelStyle}
        />
      {/each}
    </Group>
  {/if}
</Group>
