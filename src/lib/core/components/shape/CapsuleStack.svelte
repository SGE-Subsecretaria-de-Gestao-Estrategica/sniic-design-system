<script lang="ts">
  /**
   * A `CapsuleBar` split into segments: the same flat base and round tip, the
   * tip belonging to the stack as a whole rather than to its last segment.
   * Thin gaps in the background colour keep adjacent segments apart even when
   * their colours are close.
   *
   * Takes its box like a `rect`; `capsuleStack` in `core/utils/shapeFactory.ts`
   * cuts it into pieces. Unset styles come from the theme's `capsule` role.
   */
  import { DefaultTheme, getChartTheme, resolveThemeStyles } from "$lib/core/theme";
  import { capsuleStack } from "$lib/core/utils/shapeFactory";
  import type { CapsuleStackProps } from "$lib/types/CapsuleStack";

  let {
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    orientation = "vertical",
    reverse = false,
    segments,
    gap,
    gapFill,
    class: className,
    ...restProps
  }: CapsuleStackProps = $props();

  const uid = $props.id();
  const theme = getChartTheme();

  let style = $derived(resolveThemeStyles({ gap, gapFill }, theme?.capsule, DefaultTheme.capsule));
  let shape = $derived(
    capsuleStack(segments, { x, y, width, height, reverse, orientation, gap: style.gap }),
  );
</script>

{#if shape.total > 0 && shape.thickness > 0}
  <g class={["capsule-stack", className]} {...restProps}>
    <defs>
      <clipPath id="{uid}-box">
        <rect {...shape.clip} />
      </clipPath>
      <clipPath id="{uid}-cap">
        <path d={shape.path} />
      </clipPath>
    </defs>

    <g clip-path="url(#{uid}-box)">
      <g clip-path="url(#{uid}-cap)">
        {#each shape.pieces as piece (piece.index)}
          <rect {...piece.rect} fill={piece.fill} fill-opacity={piece.fillOpacity} />
        {/each}
        {#each shape.gaps as rect, i (i)}
          <rect {...rect} fill={style.gapFill} />
        {/each}
      </g>
    </g>
  </g>
{/if}
