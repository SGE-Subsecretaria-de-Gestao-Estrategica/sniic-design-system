<script lang="ts" generics="Scale extends AxisScale">
  import Orientation from "$lib/core/constants/orientation";
  import type { AxisRendererProps, AxisScale } from "$lib/types/Axis";
  import type { TextProps } from "$lib/types/Text";
  import Line from "../shape/Line.svelte";
  import Ticks from "./Ticks.svelte";
  import Text from "../Text.svelte";
  import getLabelTransform from "$lib/core/utils/getLabelTransform";

  const defaultTextProps: Partial<TextProps> = {
    textAnchor: "middle",
  };

  let {
    axisFromPoint,
    axisLineClassName,
    axisToPoint,
    hideAxisLine,
    hideTicks,
    horizontal,
    label = "",
    labelClassName,
    labelOffset = 14,
    labelProps,
    orientation = Orientation.bottom,
    scale,
    stroke = "#222",
    strokeDasharray,
    strokeWidth = 1,
    tickClassName,
    tickLineProps,
    tickLabelProps,
    tickLength = 8,
    tickStroke = "#222",
    tickTransform,
    ticks,
    tickComponent,
    ticksComponent,
  }: AxisRendererProps<Scale> = $props();

  let combinedLabelProps = $derived({
    ...defaultTextProps,
    ...labelProps,
  });

  // Tick labels hang off the axis, so their anchor follows the orientation:
  // a centred label on a left axis runs back over the plot area, which long
  // category names make obvious. Overridable via `tickLabelProps`.
  let tickAnchorProps = $derived({
    textAnchor:
      orientation === Orientation.left
        ? "end"
        : orientation === Orientation.right
          ? "start"
          : "middle",
    ...(horizontal ? null : { verticalAnchor: "middle" }),
  } as Partial<TextProps>);

  let tickLabelPropsDefault = $derived({
    ...defaultTextProps,
    ...tickAnchorProps,
    ...(typeof tickLabelProps === "object" ? tickLabelProps : null),
  });

  let allTickLabelProps = $derived(
    ticks.map(({ value, index }) =>
      typeof tickLabelProps === "function"
        ? tickLabelProps(value, index, ticks)
        : tickLabelPropsDefault,
    ),
  );

  let maxTickLabelFontSize = $derived(
    Math.max(
      10,
      ...allTickLabelProps.map((props) =>
        typeof props.fontSize === "number" ? props.fontSize : 0,
      ),
    ),
  );

  let ticksComponentProps = $derived({
    hideTicks,
    horizontal,
    orientation,
    scale,
    tickClassName,
    tickComponent,
    tickLabelProps: allTickLabelProps,
    tickStroke,
    tickTransform,
    ticks,
    strokeWidth,
    tickLineProps,
  });
</script>

{#if ticksComponent}
  {@render ticksComponent(ticksComponentProps)}
{:else}
  <Ticks {...ticksComponentProps} />
{/if}

{#if !hideAxisLine}
  <Line
    class={["axis-line", axisLineClassName]}
    from={axisFromPoint}
    to={axisToPoint}
    {stroke}
    stroke-width={strokeWidth}
    stroke-dasharray={strokeDasharray}
  />
{/if}

{#if label}
  <Text
    class={["axis-label", labelClassName]}
    {...getLabelTransform({
      labelOffset,
      labelProps: combinedLabelProps,
      orientation,
      range: scale.range(),
      tickLabelFontSize: maxTickLabelFontSize,
      tickLength,
    })}
    {...combinedLabelProps}
    text={label}
  />
{/if}
