<script lang="ts" generics="D">
  import { DefaultTheme, getChartTheme } from "$lib/core/theme";
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { DifferenceStemsProps } from "$lib/types/DifferenceStems";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import Line from "../shape/Line.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    fill,
    fillOpacity,
    showBaseline = false,
    baselineStroke,
    baselineStrokeWidth,
    showValues = true,
    formatValue = (stem) => String(stem.value),
    endLabelWidth,
    labelFill,
    fontSize,
    fontWeight,
  }: DifferenceStemsProps<D> = $props();

  const theme = getChartTheme();
  const mark = $derived({ ...DefaultTheme.auxiliaryMark, ...theme?.auxiliaryMark });
</script>

<Group class={["difference-stems", className]} {top} {left}>
  {#if showBaseline}
    <Line
      role="baseline"
      from={{ x: 0, y: layout.baselineY }}
      to={{ x: layout.width, y: layout.baselineY }}
      stroke={baselineStroke}
      strokeWidth={baselineStrokeWidth}
    />
  {/if}

  <Group class="difference-stems__stems">
    {#each layout.stems as stem (stem.key)}
      <rect
        x={stem.rect.x}
        y={stem.rect.y}
        width={stem.rect.width}
        height={stem.rect.height}
        rx={stem.cornerRadius}
        fill={resolveValue(fill, stem) ?? mark.fill}
        fill-opacity={resolveValue(fillOpacity, stem) ?? mark.fillOpacity}
      />
    {/each}
  </Group>

  <Group class="difference-stems__values">
    {#each layout.stems as stem (stem.key)}
      {#if resolveValue(showValues, stem)}
        <PlacedLabel
          variant="valueLabel"
          placement={stem.label}
          text={formatValue(stem)}
          width={stem.isLast ? endLabelWidth : undefined}
          fill={labelFill}
          {fontSize}
          {fontWeight}
        />
      {/if}
    {/each}
  </Group>
</Group>
