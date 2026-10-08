<script lang="ts">
  /**
   * A translucent patch of the chart background laid between a label and the
   * marks under it, so a number or name can keep its dark ink even where it
   * crosses a line, an area or a bar: the marks still show through, faded,
   * and the text keeps its contrast.
   *
   * Wrap the label in it — the patch is measured from whatever it wraps,
   * padded and drawn behind it. Place it after the marks it should cover.
   * Pass `x`/`y`/`width`/`height` to set the box yourself (server rendering,
   * or a patch bigger than the text).
   */
  import { observeBBox } from "$lib/core/attachments/observeBBox";
  import type { Rect } from "$lib/core/layouts/types";
  import { DefaultTheme, getChartTheme, resolveThemeStyles } from "$lib/core/theme";
  import { padBox } from "$lib/core/utils/padBox";
  import type { LabelMaskProps } from "$lib/types/LabelMask";

  let {
    children,
    fill,
    fillOpacity,
    padding,
    radius,
    x,
    y,
    width,
    height,
  }: LabelMaskProps = $props();

  const theme = getChartTheme();

  let measured = $state<Rect | null>(null);

  let style = $derived(
    resolveThemeStyles({ fill, fillOpacity, padding, radius }, theme?.labelMask, DefaultTheme.labelMask),
  );
  let box = $derived({
    x: x ?? measured?.x ?? 0,
    y: y ?? measured?.y ?? 0,
    width: width ?? measured?.width ?? 0,
    height: height ?? measured?.height ?? 0,
  });
</script>

<g class="label-mask">
  {#if box.width > 0 && box.height > 0}
    <rect
      {...padBox(box, style.padding)}
      rx={style.radius}
      fill={style.fill}
      fill-opacity={style.fillOpacity}
      pointer-events="none"
    />
  {/if}
  <g {@attach observeBBox((b) => (measured = b))}>
    {@render children()}
  </g>
</g>
