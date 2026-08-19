<script lang="ts">
  import {
    DefaultTheme,
    getCategoricalColor,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";
  import getStringWidth from "$lib/core/utils/getStringWidth";
  import Point from "$lib/entities/Point";
  import type { ComputedLegendItem, LegendProps } from "$lib/types/Legend";
  import Group from "../Group.svelte";
  import Text from "../Text.svelte";
  import Line from "../shape/Line.svelte";

  let {
    items = [],
    top = 0,
    left = 0,
    direction,
    shape,
    shapeSize,
    labelGap,
    itemSpacing,
    color,
    labelProps,
    className,
    item,
  }: LegendProps = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      {
        direction,
        shape,
        shapeSize,
        labelGap,
        itemSpacing,
        labelProps,
      },
      theme?.legend,
      DefaultTheme.legend,
    ),
  );

  let fontSize = $derived(
    typeof style.labelProps?.fontSize === "number"
      ? style.labelProps.fontSize
      : DefaultTheme.text.fontSize,
  );

  let swatch = $derived(style.shapeSize ?? DefaultTheme.legend.shapeSize);
  let gap = $derived(style.labelGap ?? DefaultTheme.legend.labelGap);

  /** Falls back to an em-width estimate when there is no DOM to measure in. */
  function labelWidth(label: string) {
    return getStringWidth(label, `font-size: ${fontSize}px`) ?? label.length * fontSize * 0.6;
  }

  let computedItems = $derived.by(() => {
    const isRow = style.direction === "row";
    let cursor = 0;

    return items.map((entry, index): ComputedLegendItem => {
      const step = isRow
        ? (itemSpacing ?? swatch + gap + labelWidth(entry.label) + gap * 3)
        : (itemSpacing ?? Math.max(swatch, fontSize) + gap);

      const position = cursor;
      cursor += step;

      return {
        ...entry,
        index,
        x: isRow ? position : 0,
        y: isRow ? 0 : position,
        color:
          entry.color ?? color?.(entry, index) ?? getCategoricalColor(index, theme),
        shape: entry.shape ?? style.shape ?? "rect",
      };
    });
  });
</script>

<Group class={["legend", className]} {top} {left}>
  {#each computedItems as entry (`legend-${entry.index}-${entry.label}`)}
    {#if item}
      {@render item(entry)}
    {:else}
      <Group left={entry.x} top={entry.y}>
        {#if entry.shape === "circle"}
          <circle cx={swatch / 2} cy={swatch / 2} r={swatch / 2} fill={entry.color} />
        {:else if entry.shape === "line"}
          <Line
            from={new Point({ x: 0, y: swatch / 2 })}
            to={new Point({ x: swatch, y: swatch / 2 })}
            stroke={entry.color}
            strokeWidth={2}
          />
        {:else}
          <rect width={swatch} height={swatch} rx={2} fill={entry.color} />
        {/if}

        <Text
          x={swatch + gap}
          y={swatch / 2}
          verticalAnchor="middle"
          {...style.labelProps}
          text={entry.label}
        />
      </Group>
    {/if}
  {/each}
</Group>
