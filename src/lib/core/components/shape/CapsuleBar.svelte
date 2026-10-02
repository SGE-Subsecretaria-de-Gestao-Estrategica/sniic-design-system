<script lang="ts">
  /**
   * The Cultura em Números bar: a thick stroke with a flat base and a fully
   * round tip, filled with a gradient that brightens toward the tip, and a dot
   * sitting concentric with the tip.
   *
   * It is the line charts' mark turned on its side — the 12px round-capped
   * stroke with a marker on top — so bars and lines read as one family.
   *
   * A bar shorter than its own cap is not inflated to fit: the cap is drawn
   * where it would be and clipped at the base, so a tiny value shows as a
   * sliver of the disc, never as a full circle that would claim more than the
   * value. The dot is clipped the same way.
   */
  import * as d3 from "d3";
  import { DefaultTheme, getChartTheme } from "$lib/core/theme";
  import type { CapsuleBarProps } from "$lib/types/CapsuleBar";

  let {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    orientation = "horizontal",
    reverse = false,
    fill,
    fillOpacity,
    dot = true,
    dotFill,
    dotRatio = 0.55,
    class: className,
    ...restProps
  }: CapsuleBarProps = $props();

  const uid = $props.id();
  const theme = getChartTheme();
  const palette = theme?.palette ?? DefaultTheme.palette;

  let horizontal = $derived(orientation === "horizontal");

  /** Bar length along its axis and thickness across it, never negative. */
  let length = $derived(Math.max(0, horizontal ? width : height));
  let thickness = $derived(Math.max(0, horizontal ? height : width));
  let r = $derived(thickness / 2);

  let colors = $derived.by(() => {
    if (typeof fill === "string") return [fill, fill] as const;
    if (fill) return fill;
    const base = palette.primaryVariant ?? DefaultTheme.palette.primaryVariant;
    const tip = palette.primary ?? DefaultTheme.palette.primary;
    // The gradient stops short of the full tip colour so the dot, in that
    // colour, still reads against the end of a long bar — subtly, as an echo
    // of the line markers, not as a second mark competing with the bar.
    return [base, d3.interpolateLab(base, tip)(0.6)] as const;
  });

  let dotColor = $derived(dotFill ?? palette.primary ?? DefaultTheme.palette.primary);

  /**
   * +1 when the bar grows toward larger coordinates, -1 toward smaller.
   * Horizontal grows right (+1) unless reversed; vertical grows up (-1, SVG
   * y points down) unless reversed.
   */
  let dir = $derived(horizontal ? (reverse ? -1 : 1) : reverse ? 1 : -1);

  /** Where the bar starts and ends along its axis, in user space. */
  let baseAt = $derived(
    horizontal ? (reverse ? x + width : x) : reverse ? y : y + height,
  );
  let tipAt = $derived(baseAt + dir * length);
  /** The bar's centreline across its axis. */
  let across = $derived(horizontal ? y + r : x + r);

  const point = (along: number) =>
    horizontal ? { x: along, y: across } : { x: across, y: along };

  let base = $derived(point(baseAt));
  let tip = $derived(point(tipAt));
  /** Centre of the cap's disc: one radius back from the tip. */
  let cap = $derived(point(tipAt - dir * r));

  /**
   * The capsule before clipping. It reaches at least one full diameter behind
   * the tip, so `rx` always rounds a true half-disc at the tip; whatever
   * reaches past the base is clipped away and the base stays flat.
   */
  let capsule = $derived.by(() => {
    const span = Math.max(length + r, thickness);
    const start = Math.min(tipAt, tipAt - dir * span);
    return horizontal
      ? { x: start, y, width: span, height: thickness }
      : { x, y: start, width: thickness, height: span };
  });

  /** The visible box: exactly from base to tip. */
  let clip = $derived.by(() => {
    const start = Math.min(baseAt, tipAt);
    return horizontal
      ? { x: start, y, width: length, height: thickness }
      : { x, y: start, width: thickness, height: length };
  });
</script>

{#if length > 0 && thickness > 0}
  <g class={["capsule-bar", className]} {...restProps}>
    <defs>
      <clipPath id="{uid}-clip">
        <rect x={clip.x} y={clip.y} width={clip.width} height={clip.height} />
      </clipPath>
      <linearGradient
        id="{uid}-fill"
        gradientUnits="userSpaceOnUse"
        x1={base.x}
        y1={base.y}
        x2={tip.x}
        y2={tip.y}
      >
        <stop offset="0" stop-color={colors[0]} />
        <stop offset="1" stop-color={colors[1]} />
      </linearGradient>
    </defs>

    <g clip-path="url(#{uid}-clip)" fill-opacity={fillOpacity}>
      <rect
        x={capsule.x}
        y={capsule.y}
        width={capsule.width}
        height={capsule.height}
        rx={r}
        fill="url(#{uid}-fill)"
      />
      {#if dot}
        <circle cx={cap.x} cy={cap.y} r={r * dotRatio} fill={dotColor} />
      {/if}
    </g>
  </g>
{/if}
