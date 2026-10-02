<script lang="ts">
  /**
   * A translucent patch of the chart background laid between a label and the
   * marks under it, so a number or name can keep its dark ink even where it
   * crosses a line, an area or a bar: the marks still show through, faded,
   * and the text keeps its contrast.
   *
   * Wrap the label in it — the patch is measured from whatever it wraps
   * (`getBBox`), padded and drawn behind it. Place it after the marks it
   * should cover. Pass `x`/`y`/`width`/`height` to set the box yourself
   * (server rendering, or a patch bigger than the text).
   */
  import type { Snippet } from "svelte";
  import { DefaultTheme, getChartTheme } from "$lib/core/theme";

  interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface Props {
    children: Snippet;
    /** Patch colour; defaults to the theme's background (`palette.base[100]`). */
    fill?: string;
    /** How much of the marks under the patch is hidden: 1 hides them entirely. */
    opacity?: number;
    /** Space around the label, in px — one number, or `[horizontal, vertical]`. */
    padding?: number | [number, number];
    radius?: number;
    /** Explicit box in place of the measured one. */
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }

  let {
    children,
    fill,
    opacity = 0.75,
    padding = [6, 2],
    radius = 0,
    x,
    y,
    width,
    height,
  }: Props = $props();

  const theme = getChartTheme();

  let measured = $state<Box | null>(null);

  /**
   * Measures the wrapped label, again when its text or attributes change and
   * once the web fonts land, since the fallback font sets a different width.
   */
  function measureLabel(el: SVGGElement) {
    const measure = () => {
      const b = el.getBBox();
      measured = { x: b.x, y: b.y, width: b.width, height: b.height };
    };
    measure();
    const observer = new MutationObserver(measure);
    observer.observe(el, { subtree: true, childList: true, characterData: true, attributes: true });
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
      observer.disconnect();
    };
  }

  let pad = $derived(Array.isArray(padding) ? padding : [padding, padding]);
  let box = $derived.by(() => {
    const b = {
      x: x ?? measured?.x ?? 0,
      y: y ?? measured?.y ?? 0,
      width: width ?? measured?.width ?? 0,
      height: height ?? measured?.height ?? 0,
    };
    return {
      x: b.x - pad[0],
      y: b.y - pad[1],
      width: b.width + pad[0] * 2,
      height: b.height + pad[1] * 2,
    };
  });
  let color = $derived(fill ?? theme?.palette?.base?.[100] ?? DefaultTheme.palette.base[100]);
  let visible = $derived(box.width > pad[0] * 2 && box.height > pad[1] * 2);
</script>

<g class="label-mask">
  {#if visible}
    <rect
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
      rx={radius}
      fill={color}
      fill-opacity={opacity}
      pointer-events="none"
    />
  {/if}
  <g {@attach measureLabel}>
    {@render children()}
  </g>
</g>
