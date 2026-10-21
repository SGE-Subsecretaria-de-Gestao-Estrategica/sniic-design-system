<script lang="ts">
  import BubbleColumns from "$lib/core/components/bubbleColumns/BubbleColumns.svelte";
  import LinearGradient from "$lib/core/components/gradient/LinearGradient.svelte";
  import type {
    BubbleColumn,
    BubbleColumnsItem,
  } from "$lib/core/layouts/bubbleColumns";
  import { fontSize, fontWeight } from "$lib/core/theme/tokens";
  import getGradientRamp from "$lib/core/utils/getGradientRamp";
  import type { Row } from "../../data/types";
  import type { ChartLayouts } from "../../registry/layouts";
  import * as d3 from "d3";
  import { labelColorOn, pickedItemFills } from "./colors";
  import type { ViewProps } from "./types";

  let {
    layout,
    id,
    margin,
    theme,
    formatValue,
    options,
  }: ViewProps<ChartLayouts["bubbleColumns"]> = $props();

  const SECONDARY_OPACITY = 0.975;

  // Same `automatic` as the "groupColors" option, so panel and chart agree.
  const fills = $derived(
    pickedItemFills(
      layout.columns.map((c) => c.group),
      options.groupColors,
      theme,
      "mainRamp",
    ),
  );

  const gradientId = (column: number, row: number) =>
    `${id}-column-${column}-row-${row}`;

  // A column on a ramp flows from one row's colour into the next.
  const gradients = $derived(
    new Map(
      layout.columns.flatMap((column) => {
        const fill = fills.get(column.group);
        if (fill?.kind !== "ramp") return [];
        const ramp = getGradientRamp(layout.rows.length, fill.colors);
        return [[column.group, ramp] as const];
      }),
    ),
  );
  const ramps = $derived(
    layout.columns.flatMap((column) =>
      (gradients.get(column.group) ?? []).map((gradient, row) => ({
        id: gradientId(column.index, row),
        ...gradient,
      })),
    ),
  );

  function fillOf(item: BubbleColumnsItem<Row>, column: BubbleColumn<Row>) {
    const fill = fills.get(column.group);
    if (!fill) return undefined;
    return fill.kind === "ramp"
      ? `url(#${gradientId(column.index, item.row)})`
      : fill.color;
  }

  /** The colour behind a label in the bubble's centre: a gradient's midpoint. */
  function backgroundOf(
    item: BubbleColumnsItem<Row>,
    column: BubbleColumn<Row>,
  ): string | undefined {
    const gradient = gradients.get(column.group)?.[item.row];
    if (gradient) return d3.interpolateRgb(gradient.from, gradient.to)(0.5);
    const fill = fills.get(column.group);
    return fill?.kind === "solid" ? fill.color : undefined;
  }

  // Inside a bubble the label is light where it is readable on the fill;
  // under a small bubble it stays on the page colour.
  function valueFillOf(
    item: BubbleColumnsItem<Row>,
    column: BubbleColumn<Row>,
  ): string | undefined {
    if (item.label.isOutside) return undefined;
    const background = backgroundOf(item, column);
    return background ? labelColorOn(background, theme) : undefined;
  }
</script>

<defs>
  {#each ramps as gradient (gradient.id)}
    <LinearGradient id={gradient.id} from={gradient.from} to={gradient.to} />
  {/each}
</defs>

<BubbleColumns
  {layout}
  top={margin.top}
  left={margin.left}
  fill={fillOf}
  fillOpacity={(_, column) => (column.isMain ? 1 : SECONDARY_OPACITY)}
  formatValue={(item) => formatValue(item.value)}
  valueFill={valueFillOf}
  labelFill={theme.palette.neutral[300]}
  fontSize={fontSize.sm}
  fontWeight={fontWeight.medium}
/>
