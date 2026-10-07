<script lang="ts" generics="D">
  import {
    getChartTheme,
    resolveBaseline,
    resolveConnector,
  } from "$lib/core/theme";
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { BubbleRowProps } from "$lib/types/BubbleRow";
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
    showBaseline = true,
    baselineStroke,
    baselineStrokeWidth,
    showBridges = true,
    bridgeStrokeOpacity,
    bridgeDasharray,
    showValues = true,
    formatValue = (item) => String(item.value),
    endLabelWidth,
    labelFill,
    fontSize,
    fontWeight,
  }: BubbleRowProps<D> = $props();

  const theme = getChartTheme();

  const baseline = $derived(
    resolveBaseline(
      { stroke: baselineStroke, strokeWidth: baselineStrokeWidth },
      theme,
    ),
  );

  const bridge = $derived(
    resolveConnector(
      baseline.strokeWidth,
      { strokeOpacity: bridgeStrokeOpacity, strokeDasharray: bridgeDasharray },
      theme,
    ),
  );
</script>

<Group class={["bubble-row", className]} {top} {left}>
  {#if showBridges}
    <Group class="bubble-row__bridges">
      {#each layout.bridges as segment, i (i)}
        <Line
          from={segment.from}
          to={segment.to}
          stroke={baseline.stroke}
          strokeWidth={bridge.strokeWidth}
          strokeOpacity={bridge.strokeOpacity}
          strokeDasharray={bridge.strokeDasharray}
        />
      {/each}
    </Group>
  {/if}

  {#if showBaseline}
    <Group class="bubble-row__baseline">
      {#each layout.baseline as segment, i (i)}
        <Line
          role="baseline"
          from={segment.from}
          to={segment.to}
          stroke={baselineStroke}
          strokeWidth={baselineStrokeWidth}
        />
      {/each}
    </Group>
  {/if}

  <Group class="bubble-row__bubbles">
    {#each layout.items as item (item.key)}
      <Circle
        x={item.x}
        y={item.y}
        size={item.radius}
        fill={resolveValue(fill, item)}
        fillOpacity={resolveValue(fillOpacity, item)}
      />
    {/each}
  </Group>

  <Group class="bubble-row__values">
    {#each layout.items as item (item.key)}
      {#if resolveValue(showValues, item)}
        <PlacedLabel
          variant="valueLabel"
          placement={item.label}
          text={formatValue(item)}
          width={item.isLast ? endLabelWidth : undefined}
          fill={labelFill}
          {fontSize}
          {fontWeight}
        />
      {/if}
    {/each}
  </Group>
</Group>
