<script lang="ts">
  import { placeLeft, placeRight } from "$lib/core/layouts/labels";
  import { spacing } from "$lib/core/theme/tokens";
  import type { LegendStepsProps } from "$lib/types/Legend";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import Line from "../shape/Line.svelte";

  let {
    colors,
    top = 0,
    left = 0,
    class: className,
    stepWidth = spacing.md,
    height = 8,
    showLine = true,
    lineOverhang = spacing.sm,
    lineStroke,
    lineStrokeWidth,
    labels,
    labelGap = spacing.xs,
    labelFill,
    fontSize,
    fontWeight,
  }: LegendStepsProps = $props();

  const width = $derived(colors.length * stepWidth);
  const overhang = $derived(showLine ? lineOverhang : 0);
  const labelStyle = $derived({ fill: labelFill, fontSize, fontWeight });
</script>

<Group class={["legend-steps", className]} {top} {left}>
  {#if showLine}
    <Line
      role="baseline"
      from={{ x: -lineOverhang, y: height / 2 }}
      to={{ x: width + lineOverhang, y: height / 2 }}
      stroke={lineStroke}
      strokeWidth={lineStrokeWidth}
    />
  {/if}

  {#each colors as color, i (i)}
    <rect x={i * stepWidth} width={stepWidth} {height} fill={color} />
  {/each}

  {#if labels}
    <PlacedLabel
      variant="tickLabel"
      placement={placeLeft({ x: -overhang, y: height / 2 }, labelGap)}
      text={labels[0]}
      {...labelStyle}
    />
    <PlacedLabel
      variant="tickLabel"
      placement={placeRight(
        { x: width + overhang, y: height / 2 },
        labelGap,
        0,
        "middle",
      )}
      text={labels[1]}
      {...labelStyle}
    />
  {/if}
</Group>
