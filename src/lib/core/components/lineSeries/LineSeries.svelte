<script lang="ts" generics="D">
  import {
    DefaultTheme,
    getChartTheme,
    resolveConnector,
  } from "$lib/core/theme";
  import type {
    LineSeriesItem,
    LineSeriesPoint,
  } from "$lib/core/layouts/lineSeries";
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { LineSeriesProps } from "$lib/types/LineSeries";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import Circle from "../markers/Circle.svelte";
  import LinePath from "../shape/LinePath.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    stroke,
    strokeWidth,
    strokeOpacity,
    showBridges = true,
    bridgeStroke,
    bridgeStrokeWidth,
    bridgeStrokeOpacity,
    bridgeDasharray,
    showMarkers = true,
    markerFill,
    markerSize,
    showValues = true,
    formatValue = (point) => String(point.yValue),
    valueFill,
    valueFontSize,
    valueFontWeight,
    endValueWidth,
    showNames = true,
    formatName = (series) => series.key,
    nameWidth,
    nameFill,
    nameFontSize,
    nameFontWeight,
  }: LineSeriesProps<D> = $props();

  const theme = getChartTheme();

  const bridge = $derived(
    resolveConnector(
      Number(
        strokeWidth ??
          theme?.line?.strokeWidth ??
          DefaultTheme.line.strokeWidth,
      ),
      {
        strokeWidth: bridgeStrokeWidth,
        strokeOpacity: bridgeStrokeOpacity,
        strokeDasharray: bridgeDasharray,
      },
      theme,
    ),
  );

  const markerColor = (point: LineSeriesPoint<D>, series: LineSeriesItem<D>) =>
    resolveValue(markerFill, point, series) ??
    theme?.marker?.circle?.fill ??
    DefaultTheme.marker.circle.fill;

  const valueColor = (point: LineSeriesPoint<D>, series: LineSeriesItem<D>) =>
    resolveValue(valueFill, point, series) ??
    (point.isEndLabel ? markerColor(point, series) : undefined);
</script>

<Group class={["line-series", className]} {top} {left}>
  {#each layout.series as series (series.key)}
    {@const lineStroke = resolveValue(stroke, series)}
    <Group class="line-series__series">
      {#if showBridges}
        {#each series.bridges as segment, i (i)}
          <LinePath
            data={[segment.from, segment.to]}
            stroke={resolveValue(bridgeStroke, series) ?? lineStroke}
            strokeWidth={bridge.strokeWidth}
            strokeOpacity={bridge.strokeOpacity}
            stroke-dasharray={bridge.strokeDasharray}
          />
        {/each}
      {/if}

      {#each series.paths as path, i (i)}
        <LinePath
          data={path}
          stroke={lineStroke}
          {strokeWidth}
          {strokeOpacity}
        />
      {/each}

      {#if showMarkers}
        {#each series.points as point (point.key)}
          <Circle
            x={point.x}
            y={point.y}
            size={resolveValue(markerSize, point, series)}
            fill={resolveValue(markerFill, point, series)}
          />
        {/each}
      {/if}

      {#each series.points as point (point.key)}
        {#if resolveValue(showValues, point, series)}
          <PlacedLabel
            variant={point.isEndLabel ? "dataLabel" : "valueLabel"}
            placement={point.label}
            text={formatValue(point, series)}
            width={point.isEndLabel ? endValueWidth : undefined}
            fill={valueColor(point, series)}
            fontSize={resolveValue(valueFontSize, point, series)}
            fontWeight={resolveValue(valueFontWeight, point, series)}
          />
        {/if}
      {/each}

      {#if showNames}
        <PlacedLabel
          variant="seriesLabel"
          placement={series.nameLabel}
          text={formatName(series)}
          width={nameWidth}
          fill={resolveValue(nameFill, series)}
          fontSize={nameFontSize}
          fontWeight={nameFontWeight}
        />
      {/if}
    </Group>
  {/each}
</Group>
