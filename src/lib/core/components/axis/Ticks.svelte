<script lang="ts" generics="Scale extends AxisScale">
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
    tickStroke = "#222",
    tickTransform,
    ticks,
    strokeWidth,
    tickLineProps,
  }: TicksRendererProps<Scale> = $props();
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
        stroke={tickStroke}
        {strokeWidth}
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
