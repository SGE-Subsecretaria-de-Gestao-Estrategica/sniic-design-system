<script lang="ts" generics="D">
  /**
   * Draws a `coverageDotsLayout`: per row a light track across the axis, a
   * ringed dot at the value, the value right of it and the name left of the
   * axis; block names above their rows; a dashed reference line behind the
   * rows; the axis with its ticks and, when it doesn't start at zero, the
   * torn-axis mark.
   *
   * Unset styles come from the theme's `coverageDots`, `baseline` and
   * `timelineBreak` roles and the `valueLabel`, `categoryLabel` and
   * `tickLabel` text roles.
   */
  import { DefaultTheme, getChartTheme, resolveThemeStyles } from "$lib/core/theme";
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { CoverageDotsProps } from "$lib/types/CoverageDots";
  import LabelMask from "../annotation/LabelMask.svelte";
  import Group from "../Group.svelte";
  import PlacedLabel from "../label/PlacedLabel.svelte";
  import Circle from "../markers/Circle.svelte";
  import Line from "../shape/Line.svelte";

  let {
    layout,
    top = 0,
    left = 0,
    class: className,
    showTracks = true,
    trackStroke,
    trackWidth,
    markerFill,
    markerStroke,
    markerStrokeWidth,
    rowOpacity = 1,
    showValues = true,
    valuesOpacity = 1,
    maskValues = true,
    showCategories = true,
    categoryWidth,
    formatValue = (row) => String(row.value),
    formatCategory = (category) => category,
    formatHeader = (block) => block.label,
    headerLeft = 0,
    headerOpacity = 1,
    showReference = true,
    referenceLabel,
    referenceOpacity = 1,
    referenceStroke,
    showAxis = true,
    formatTick = (value) => String(value),
    labelFill,
    fontSize,
    fontWeight,
  }: CoverageDotsProps<D> = $props();

  const theme = getChartTheme();

  let style = $derived(
    resolveThemeStyles(
      {
        trackStroke,
        trackWidth,
        markerFill: undefined as string | undefined,
        markerStroke,
        markerStrokeWidth,
        referenceStroke,
        referenceWidth: undefined as number | undefined,
        referenceDasharray: undefined as string | undefined,
        headerWeight: undefined as number | undefined,
      },
      theme?.coverageDots,
      DefaultTheme.coverageDots,
    ),
  );
  let breakStroke = $derived(
    resolveThemeStyles({ stroke: undefined as string | undefined }, theme?.timelineBreak, DefaultTheme.timelineBreak)
      .stroke,
  );

  const labelStyle = $derived({ fill: labelFill, fontSize, fontWeight });
</script>

<Group class={["coverage-dots", className]} {top} {left}>
  {#if showAxis}
    <Group class="coverage-dots__axis">
      <Line role="baseline" from={layout.axis.line.from} to={layout.axis.line.to} />
      {#if layout.axis.break}
        <g stroke={breakStroke} stroke-width={layout.axis.break.strokeWidth} stroke-linecap="round">
          {#each layout.axis.break.segments as { from, to }, i (i)}
            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
          {/each}
        </g>
      {/if}
      {#each layout.axis.ticks as tick (tick.value)}
        <PlacedLabel
          variant="tickLabel"
          placement={tick.label}
          text={formatTick(tick.value)}
          {...labelStyle}
        />
      {/each}
    </Group>
  {/if}

  {#if showReference && layout.reference}
    <!-- Behind the rows: the dots and their values read over it. -->
    <Line
      class="coverage-dots__reference"
      from={layout.reference.line.from}
      to={layout.reference.line.to}
      stroke={style.referenceStroke}
      strokeWidth={style.referenceWidth}
      strokeDasharray={style.referenceDasharray}
      opacity={referenceOpacity}
    />
  {/if}

  {#each layout.blocks as block (block.key)}
    <Group class="coverage-dots__block">
      {#if block.header}
        <g class="coverage-dots__header" opacity={resolveValue(headerOpacity, block)}>
          <PlacedLabel
            variant="categoryLabel"
            placement={block.header}
            left={headerLeft}
            text={formatHeader(block)}
            {...labelStyle}
            fontWeight={fontWeight ?? style.headerWeight}
          />
        </g>
      {/if}

      {#each block.rows as row (row.key)}
        <g class="coverage-dots__row" opacity={resolveValue(rowOpacity, row)}>
          {#if showTracks}
            <Line
              from={row.track.from}
              to={row.track.to}
              stroke={style.trackStroke}
              strokeWidth={style.trackWidth}
            />
          {/if}
          <Circle
            x={row.marker.x}
            y={row.marker.y}
            size={row.marker.radius}
            fill={resolveValue(markerFill, row) ?? style.markerFill}
            stroke={style.markerStroke}
            strokeWidth={style.markerStrokeWidth}
          />
          {#if resolveValue(showValues, row)}
            <g class="coverage-dots__value" opacity={valuesOpacity}>
              {#if maskValues}
                <!-- A value can sit on the reference line: the patch keeps it legible. -->
                <LabelMask>
                  <PlacedLabel
                    variant="valueLabel"
                    placement={row.valueLabel}
                    text={formatValue(row)}
                    {...labelStyle}
                  />
                </LabelMask>
              {:else}
                <PlacedLabel
                  variant="valueLabel"
                  placement={row.valueLabel}
                  text={formatValue(row)}
                  {...labelStyle}
                />
              {/if}
            </g>
          {/if}
          {#if showCategories}
            <PlacedLabel
              variant="categoryLabel"
              placement={row.categoryLabel}
              text={formatCategory(row.category)}
              width={categoryWidth}
              {...labelStyle}
            />
          {/if}
        </g>
      {/each}
    </Group>
  {/each}

  {#if showReference && layout.reference && referenceLabel}
    <g class="coverage-dots__reference-label" opacity={referenceOpacity}>
      <PlacedLabel
        variant="tickLabel"
        placement={layout.reference.label}
        text={referenceLabel}
        {...labelStyle}
        fill={labelFill ?? style.referenceStroke}
      />
    </g>
  {/if}
</Group>
