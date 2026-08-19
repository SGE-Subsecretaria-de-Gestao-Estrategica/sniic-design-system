<script lang="ts" generics="Scale extends AxisScale">
  import Orientation from "$lib/core/constants/orientation";
  import type { OrientationType } from "$lib/core/constants/orientation";
  import useAxis from "$lib/core/hooks/useAxis.svelte";
  import {
    DefaultTheme,
    getChartTheme,
    resolveThemeStyles,
  } from "$lib/core/theme";
  import type { AxisScale, SharedAxisProps } from "$lib/types/Axis";
  import Group from "../Group.svelte";
  import AxisRenderer from "./AxisRenderer.svelte";

  type AxisProps<Scale extends AxisScale> = SharedAxisProps<Scale> & {
    orientation?: OrientationType;
  };

  let {
    children,
    axisClassName,
    innerRef = $bindable(null),
    left = 0,
    // Left undefaulted so useAxis can pick per scale type: ~10 for continuous
    // scales, every category for band/point ones.
    numTicks,
    orientation = Orientation.bottom,
    rangePadding = 0,
    scale,
    tickFormat,
    tickValues,
    top = 0,
    // themeable
    hideAxisLine,
    hideTicks,
    hideZero,
    stroke,
    strokeWidth,
    strokeDasharray,
    tickStroke,
    tickLength,
    tickLabelProps,
    labelProps,
    tickLineProps,
    ...restProps
  }: AxisProps<Scale> = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      {
        hideAxisLine,
        hideTicks,
        hideZero,
        stroke,
        strokeWidth,
        strokeDasharray,
        tickStroke,
        tickLength,
        tickLabelProps,
        labelProps,
        tickLineProps,
      },
      theme?.axis,
      DefaultTheme.axis,
    ),
  );

  let axis = $derived(
    useAxis({
      ...restProps,
      ...style,
      numTicks,
      orientation,
      rangePadding,
      scale,
      tickFormat,
      tickValues,
    }),
  );
</script>

<Group
  bind:ref={innerRef}
  class={[axisClassName]}
  transform="translate({left},{top})"
>
  {#if children}
    {children(axis)}
  {:else}
    <AxisRenderer {...axis} />
  {/if}
</Group>
