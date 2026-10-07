<script lang="ts" generics="D">
  import type { HorizontalBar } from "$lib/core/layouts/horizontalBars";
  import type { HorizontalBarsProps } from "$lib/types/HorizontalBars";
  import resolveValue from "$lib/core/utils/resolveValue";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import Circle from "../markers/Circle.svelte";
  import Line from "../shape/Line.svelte";

  let {
    layout,
    id,
    top = 0,
    left = 0,
    class: className,
    barFill,
    barOpacity,
    clipToPlotArea = true,
    showMarkers = true,
    markerFill,
    showBaseline = true,
    baselineStroke,
    baselineStrokeWidth,
    showValues = true,
    showCategories = true,
    formatValue = (bar) => String(bar.value),
    formatCategory = (category) => category,
    labelFill,
    fontSize,
    fontWeight,
  }: HorizontalBarsProps<D> = $props();

  const labelStyle = $derived({ fill: labelFill, fontSize, fontWeight });
  const plotAreaId = $derived(`${id}-plotarea`);
  const barClipId = (bar: HorizontalBar<D>) => `${id}-bar-${bar.index}`;
</script>

<Group class={["horizontal-bars", className]} {top} {left}>
  <defs>
    <clipPath id={plotAreaId}>
      <rect width={layout.width} height={layout.height} />
    </clipPath>
    {#each layout.bars as bar (bar.key)}
      <clipPath id={barClipId(bar)}>
        <path d={bar.clipPath} />
      </clipPath>
    {/each}
  </defs>

  <Group
    class="horizontal-bars__plot"
    clip-path={clipToPlotArea ? `url(#${plotAreaId})` : undefined}
  >
    <Group class="horizontal-bars__bars">
      {#each layout.bars as bar (bar.key)}
        <rect
          y={bar.y}
          width={bar.length}
          height={bar.thickness}
          fill={resolveValue(barFill, bar)}
          fill-opacity={barOpacity}
          clip-path="url(#{barClipId(bar)})"
        />
      {/each}
    </Group>

    {#if showMarkers}
      <Group class="horizontal-bars__markers">
        {#each layout.bars as bar (bar.key)}
          <Circle
            x={bar.marker.x}
            y={bar.marker.y}
            size={bar.marker.radius}
            fill={resolveValue(markerFill, bar)}
          />
        {/each}
      </Group>
    {/if}
  </Group>

  {#if showValues}
    <Group class="horizontal-bars__values">
      {#each layout.bars as bar (bar.key)}
        <PlacedLabel
          variant="valueLabel"
          placement={bar.valueLabel}
          text={formatValue(bar)}
          {...labelStyle}
        />
      {/each}
    </Group>
  {/if}

  {#if showCategories}
    <Group class="horizontal-bars__categories">
      {#each layout.bars as bar (bar.key)}
        <PlacedLabel
          variant="categoryLabel"
          placement={bar.categoryLabel}
          text={formatCategory(bar.category)}
          {...labelStyle}
        />
      {/each}
    </Group>
  {/if}

  {#if showBaseline}
    <Line
      role="baseline"
      from={layout.baseline.from}
      to={layout.baseline.to}
      stroke={baselineStroke}
      strokeWidth={baselineStrokeWidth}
    />
  {/if}
</Group>
