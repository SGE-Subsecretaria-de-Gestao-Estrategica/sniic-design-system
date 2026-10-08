<script lang="ts" generics="D, K extends string = string">
  /**
   * Draws the groups `barGroupLayout` computes, a `Bar` per rect. A bar
   * takes `color` for its series, or the theme's categorical colour for its
   * position in the group.
   */
  import { getCategoricalColor, getChartTheme } from "$lib/core/theme";
  import type { BarGroupProps, ComputedBarGroup } from "$lib/types/Bar";
  import Group from "../Group.svelte";
  import Bar from "../shape/Bar.svelte";

  let { layout, color, rx, ry, top = 0, left = 0, className, children }: BarGroupProps<D, K> =
    $props();

  const theme = getChartTheme();

  let barGroups = $derived(
    layout.groups.map(
      (group): ComputedBarGroup<D, K> => ({
        ...group,
        bars: group.bars.map((bar) => ({
          ...bar,
          color: color?.(bar.series, bar.index) ?? getCategoricalColor(bar.index, theme),
        })),
      }),
    ),
  );
</script>

<Group class={["bar-group", className]} {top} {left}>
  {#if children}
    {@render children({ barGroups })}
  {:else}
    {#each barGroups as group (group.index)}
      {#each group.bars as bar (bar.index)}
        <Bar x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill={bar.color} {rx} {ry} />
      {/each}
    {/each}
  {/if}
</Group>
