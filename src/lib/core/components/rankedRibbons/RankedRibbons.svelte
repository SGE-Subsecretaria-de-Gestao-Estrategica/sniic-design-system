<script lang="ts" generics="D">
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";
  import type { TextStyle } from "$lib/core/theme/types";
  import {
    placeValue,
    type RankedRibbonsSlot,
  } from "$lib/core/layouts/rankedRibbons";
  import getStringWidth from "$lib/core/utils/getStringWidth";
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { RankedRibbonsProps } from "$lib/types/RankedRibbons";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import Line from "../shape/Line.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    fill,
    seriesOpacity = 1,
    outlineStroke,
    outlineWidth,
    bridgeOpacity,
    showValues = (slot) => !slot.isEndLabel,
    formatValue = (slot) => String(slot.value),
    valueFill,
    showTotals = true,
    formatTotal = (column) => String(column.total),
    totalFill,
    showEnds = true,
    endValueFill,
    formatName = (ribbon) => ribbon.key,
    nameWidth,
    labelsOpacity = 1,
  }: RankedRibbonsProps<D> = $props();

  const theme = getChartTheme();

  const ribbonStyle = $derived(
    resolveThemeStyles(
      {
        outlineStroke,
        outlineWidth,
        leaderStroke: undefined as string | undefined,
        leaderWidth: undefined as number | undefined,
      },
      theme?.ribbon,
      DefaultTheme.ribbon,
    ),
  );
  const bridgeFillOpacity = $derived(
    bridgeOpacity ??
      theme?.connector?.strokeOpacity ??
      DefaultTheme.connector.strokeOpacity,
  );
  const valueStyle = $derived(
    resolveThemeStyles(
      {} as TextStyle,
      theme?.valueLabel,
      DefaultTheme.valueLabel,
    ),
  );

  const asked = (slot: RankedRibbonsSlot<D>) =>
    slot.value > 0 &&
    slot.labelFits &&
    resolveValue(showValues, slot, layout.columns[slot.column]);
  // A column whose values are all hidden leaves its bends free to its neighbours'.
  const showing = $derived(layout.columns.map((c) => c.slots.some(asked)));

  /** The value's position, or `null` where it doesn't fit. */
  function valueAt(slot: RankedRibbonsSlot<D>, text: string) {
    if (!asked(slot)) return null;
    const { x, y, room } = placeValue(
      slot,
      {
        left: showing[slot.column - 1] === false,
        right: showing[slot.column + 1] === false,
      },
      layout.valueLabelPadding,
    );
    const size = Number(valueStyle.fontSize);
    const width =
      getStringWidth(
        text,
        `font-size:${size}px;font-family:${valueStyle.fontFamily};font-weight:${valueStyle.fontWeight}`,
      ) ?? text.length * size * 0.6;
    return width <= room
      ? { x, y, textAnchor: "middle" as const, verticalAnchor: "middle" as const }
      : null;
  }

  const opacityOf = (series: string) => resolveValue(seriesOpacity, series);
  const fillOf = $derived(
    new Map(layout.ribbons.map((r) => [r.key, resolveValue(fill, r)])),
  );
</script>

<Group class={["ranked-ribbons", className]} {top} {left}>
  {#each layout.ribbons as ribbon (ribbon.key)}
    <g class="ranked-ribbons__ribbon" opacity={opacityOf(ribbon.key)}>
      {#each ribbon.bridges as d, i (i)}
        <path
          {d}
          fill={fillOf.get(ribbon.key)}
          fill-opacity={bridgeFillOpacity}
          stroke={ribbonStyle.outlineStroke}
          stroke-width={ribbonStyle.outlineWidth}
          stroke-linejoin="round"
        />
      {/each}
      {#each ribbon.paths as d, i (i)}
        <path
          {d}
          fill={fillOf.get(ribbon.key)}
          stroke={ribbonStyle.outlineStroke}
          stroke-width={ribbonStyle.outlineWidth}
          stroke-linejoin="round"
        />
      {/each}
    </g>
  {/each}

  {#if showTotals}
    <Group class="ranked-ribbons__totals">
      {#each layout.columns as column (column.key)}
        <PlacedLabel
          variant="totalLabel"
          placement={column.totalLabel}
          text={formatTotal(column)}
          fill={resolveValue(totalFill, column)}
        />
      {/each}
    </Group>
  {/if}

  <g class="ranked-ribbons__labels" opacity={labelsOpacity}>
    {#each layout.columns as column (column.key)}
      {#each column.slots as slot (slot.key)}
        {@const text = formatValue(slot)}
        {@const placement = valueAt(slot, text)}
        {#if placement}
          <g opacity={opacityOf(slot.series)}>
            <PlacedLabel
              variant="valueLabel"
              {placement}
              {text}
              fill={resolveValue(valueFill, slot)}
            />
          </g>
        {/if}
      {/each}
    {/each}

    {#if showEnds}
      {#each layout.ribbons as ribbon (ribbon.key)}
        {#if ribbon.end}
          <g opacity={opacityOf(ribbon.key)}>
            <Line
              from={ribbon.end.leader.from}
              to={ribbon.end.leader.to}
              stroke={ribbonStyle.leaderStroke}
              strokeWidth={ribbonStyle.leaderWidth}
            />
            <PlacedLabel
              variant="dataLabel"
              placement={ribbon.end.value}
              text={formatValue(ribbon.last)}
              fill={resolveValue(endValueFill, ribbon) ?? fillOf.get(ribbon.key)}
            />
            <PlacedLabel
              variant="seriesLabel"
              placement={ribbon.end.name}
              text={formatName(ribbon)}
              width={nameWidth}
            />
          </g>
        {/if}
      {/each}
    {/if}
  </g>
</Group>
