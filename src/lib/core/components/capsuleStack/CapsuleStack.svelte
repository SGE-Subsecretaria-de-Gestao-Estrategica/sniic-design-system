<script lang="ts">
  /**
   * A `CapsuleBar` split into segments: the same flat base and round tip, the
   * tip belonging to the stack as a whole rather than to its last segment.
   * Thin gaps in the background colour keep adjacent segments apart even when
   * their colours are close.
   *
   * Draws the geometry `capsuleStackLayout` computes.
   */
  import { getChartTheme, resolveCapsule } from "$lib/core/theme";
  import type { CapsuleStackProps } from "$lib/types/CapsuleStack";

  let { layout, gapFill, class: className, ...restProps }: CapsuleStackProps = $props();

  const uid = $props.id();
  const theme = getChartTheme();

  let style = $derived(resolveCapsule({ gapFill }, theme));
</script>

{#if layout.total > 0 && layout.thickness > 0}
  <g class={["capsule-stack", className]} {...restProps}>
    <defs>
      <clipPath id="{uid}-box">
        <rect {...layout.clip} />
      </clipPath>
      <clipPath id="{uid}-cap">
        <path d={layout.path} />
      </clipPath>
    </defs>

    <g clip-path="url(#{uid}-box)">
      <g clip-path="url(#{uid}-cap)">
        {#each layout.pieces as piece (piece.index)}
          <rect {...piece.rect} fill={piece.fill} fill-opacity={piece.fillOpacity} />
        {/each}
        {#each layout.gaps as gap, i (i)}
          <rect {...gap} fill={style.gapFill} />
        {/each}
      </g>
    </g>
  </g>
{/if}
