<script lang="ts">
  /**
   * A `CapsuleBar` split into segments: the same flat base and round tip, the
   * tip belonging to the stack as a whole rather than to its last segment.
   *
   * The whole stack is one capsule clipped to exactly its total length, and
   * the segments are plain bands inside it — so a stack reads as one bar of
   * the family, and no segment gets rounded corners that would shave off
   * area the value does not lose. Thin gaps in the background colour keep
   * adjacent segments apart even when their colours are close.
   */
  import { DefaultTheme, getChartTheme } from "$lib/core/theme";
  import type { CapsuleStackProps } from "$lib/types/CapsuleStack";

  let {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    orientation = "vertical",
    segments,
    gap = 2,
    gapFill,
    class: className,
    ...restProps
  }: CapsuleStackProps = $props();

  const uid = $props.id();
  const theme = getChartTheme();

  let horizontal = $derived(orientation === "horizontal");
  let thickness = $derived(Math.max(0, horizontal ? height : width));
  let r = $derived(thickness / 2);
  let total = $derived(segments.reduce((sum, s) => sum + Math.max(0, s.length), 0));
  let gapColor = $derived(gapFill ?? theme?.palette?.base?.[100] ?? DefaultTheme.palette.base[100]);

  /** Position along the axis: distance from the base, mapped to user space. */
  const along = (distance: number) =>
    horizontal ? x + distance : y + height - distance;

  /** A band from `from` to `to` (distances from the base) as a rect. */
  function band(from: number, to: number) {
    const a = along(from);
    const b = along(to);
    return horizontal
      ? { x: Math.min(a, b), y, width: Math.abs(b - a), height: thickness }
      : { x, y: Math.min(a, b), width: thickness, height: Math.abs(b - a) };
  }

  let pieces = $derived.by(() => {
    let cursor = 0;
    return segments
      .filter((s) => s.length > 0)
      .map((s) => {
        const from = cursor;
        cursor += s.length;
        return { ...s, from, to: cursor };
      });
  });

  /** The visible box: exactly from the base to the stack's total length. */
  let clip = $derived(band(0, total));
  /** The capsule, reaching a full diameter past the base so the base clips flat. */
  let capsule = $derived(band(total - Math.max(total + r, thickness), total));
</script>

{#if total > 0 && thickness > 0}
  <g class={["capsule-stack", className]} {...restProps}>
    <defs>
      <clipPath id="{uid}-box">
        <rect x={clip.x} y={clip.y} width={clip.width} height={clip.height} />
      </clipPath>
      <clipPath id="{uid}-cap">
        <rect
          x={capsule.x}
          y={capsule.y}
          width={capsule.width}
          height={capsule.height}
          rx={r}
        />
      </clipPath>
    </defs>

    <g clip-path="url(#{uid}-box)">
      <g clip-path="url(#{uid}-cap)">
        {#each pieces as piece, i (i)}
          {@const rect = band(piece.from, piece.to)}
          <rect {...rect} fill={piece.fill} fill-opacity={piece.fillOpacity} />
        {/each}
        {#each pieces.slice(1) as piece, i (i)}
          {@const line = band(piece.from - gap / 2, piece.from + gap / 2)}
          <rect {...line} fill={gapColor} />
        {/each}
      </g>
    </g>
  </g>
{/if}
