<script lang="ts" generics="Scale extends AxisScale">
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";
  import type { AxisScale, TicksRendererProps } from "$lib/types/Axis";
  import Orientation from "$lib/core/constants/orientation";
  import Group from "../Group.svelte";
  import Line from "../shape/Line.svelte";
  import Text from "../Text.svelte";

  let {
    hideTicks,
    horizontal,
    orientation,
    tickClassName,
    tickComponent,
    tickLabelProps: allTickLabelProps,
    tickStroke,
    tickTransform,
    ticks,
    strokeWidth,
    tickLineProps,
  }: TicksRendererProps<Scale> = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles({ tickStroke, strokeWidth }, theme?.axis, DefaultTheme.axis),
  );
</script>

{#each ticks as { value, index, from, to, formattedValue } (`tick-${value}-${index}`)}
  {@const tickLabelProps = allTickLabelProps[index] ?? {}}
  {@const tickLabelFontSize = Math.max(
    10,
    (typeof tickLabelProps.fontSize === "number" && tickLabelProps.fontSize) ||
      0,
  )}
  {@const tickYCoord =
    to.y +
    (horizontal && orientation !== Orientation.top ? tickLabelFontSize : 0)}

  <Group class={["axis-tick", tickClassName]} transform={tickTransform}>
    {#if !hideTicks}
      <Line
        {from}
        {to}
        stroke={style.tickStroke}
        strokeWidth={style.strokeWidth}
        stroke-linecap="square"
        {...tickLineProps}
      />
    {/if}

    {#if tickComponent}
      {@render tickComponent({
        ...tickLabelProps,
        x: to.x,
        y: tickYCoord,
        formattedValue,
      })}
    {:else}
      <Text x={to.x} y={tickYCoord} {...tickLabelProps} text={formattedValue} />
    {/if}
  </Group>
{/each}
