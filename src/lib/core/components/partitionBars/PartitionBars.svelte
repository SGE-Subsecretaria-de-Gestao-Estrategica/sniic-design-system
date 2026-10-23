<script lang="ts" generics="D">
  /**
   * Draws a `partitionBarsLayout` in the family's bar grammar: each row is a
   * `CapsuleBar` — flat base, round tip, gradient and dot — over a light
   * track of the same shape, the name in the left gutter and the value in a
   * column past the 100% end. Pieces are the same, thinner, on a track as long
   * as their part. Block names sit above their rows; a thin baseline marks
   * the shared zero of each block, drawn over the bars as in the ranking.
   *
   * Unset styles come from the theme's `partition`, `capsule` and `baseline`
   * roles and the `valueLabel` and `categoryLabel` text roles.
   */
  import { DefaultTheme, getChartTheme, resolveThemeStyles } from "$lib/core/theme";
  import type { PartitionBarsProps } from "$lib/types/PartitionBars";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import CapsuleBar from "../shape/CapsuleBar.svelte";
  import Line from "../shape/Line.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    trackFill,
    barFill,
    rowOpacity = () => 1,
    piecesOpacity = 1,
    valuesOpacity = 1,
    formatValue = (row) => `${Math.round(row.share * 100)}%`,
    formatCategory = (row) => row.label,
    categoryWidth,
    pieceFontSize,
    valueWeight,
    formatHeader = (block) => block.label,
    headerLeft = 0,
    baselineStroke,
    baselineWidth,
    labelFill,
    fontSize,
    fontWeight,
  }: PartitionBarsProps<D> = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      { trackFill, headerWeight: undefined as number | undefined },
      theme?.partition,
      DefaultTheme.partition,
    ),
  );

  const labelStyle = $derived({ fill: labelFill, fontWeight });
</script>

<Group class={["partition-bars", className]} {top} {left}>
  {#each layout.blocks as block (block.key)}
    <Group class="partition-bars__block">
      {#if block.header}
        <PlacedLabel
          variant="categoryLabel"
          placement={block.header}
          left={headerLeft}
          text={formatHeader(block)}
          {fontSize}
          fill={labelFill}
          fontWeight={style.headerWeight}
        />
      {/if}

      {#each block.rows as row (row.key)}
        {@const size = row.kind === "piece" ? (pieceFontSize ?? fontSize) : fontSize}
        <g
          class={["partition-bars__row", `partition-bars__row--${row.kind}`]}
          opacity={rowOpacity(row) * (row.kind === "piece" ? piecesOpacity : 1)}
        >
          <CapsuleBar
            x={0}
            y={row.y}
            width={row.trackLength}
            height={row.thickness}
            fill={style.trackFill}
            dot={false}
          />
          <CapsuleBar x={0} y={row.y} width={row.barLength} height={row.thickness} fill={barFill?.(row)} />
          <PlacedLabel
            variant="categoryLabel"
            placement={row.categoryLabel}
            text={formatCategory(row)}
            width={categoryWidth}
            fontSize={size}
            {...labelStyle}
          />
          <g class="partition-bars__value" opacity={valuesOpacity}>
            <PlacedLabel
              variant="valueLabel"
              placement={row.valueLabel}
              text={formatValue(row)}
              fontSize={size}
              {...labelStyle}
              fontWeight={valueWeight ?? fontWeight}
            />
          </g>
        </g>
      {/each}

      <!-- Over the bars: every one of them starts here. -->
      <Line
        role="baseline"
        from={block.baseline.from}
        to={block.baseline.to}
        stroke={baselineStroke}
        strokeWidth={baselineWidth}
      />
    </Group>
  {/each}
</Group>
