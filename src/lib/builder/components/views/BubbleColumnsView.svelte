<script lang="ts">
  import BubbleColumns from "$lib/core/components/bubbleColumns/BubbleColumns.svelte";
  import LinearGradient from "$lib/core/components/gradient/LinearGradient.svelte";
  import { fontSize, fontWeight } from "$lib/core/theme/tokens";
  import getGradientRamp from "$lib/core/utils/getGradientRamp";
  import type { ChartLayouts } from "../../registry/layouts";
  import type { ViewProps } from "./types";

  let {
    layout,
    id,
    margin,
    theme,
    formatValue,
  }: ViewProps<ChartLayouts["bubbleColumns"]> = $props();

  const SECONDARY_OPACITY = 0.975;

  // The main column flows from one row's colour into the next.
  const gradients = $derived(
    getGradientRamp(layout.rows.length, [
      theme.palette.primary,
      theme.palette.primaryVariant,
    ]),
  );
</script>

<defs>
  {#each gradients as gradient, i (i)}
    <LinearGradient id="{id}-row-{i}" from={gradient.from} to={gradient.to} />
  {/each}
</defs>

<BubbleColumns
  {layout}
  top={margin.top}
  left={margin.left}
  fill={(item, column) =>
    column.isMain ? `url(#${id}-row-${item.row})` : theme.palette.secondary}
  fillOpacity={(_, column) => (column.isMain ? 1 : SECONDARY_OPACITY)}
  formatValue={(item) => formatValue(item.value)}
  labelFill={theme.palette.neutral[300]}
  fontSize={fontSize.sm}
  fontWeight={fontWeight.medium}
/>
