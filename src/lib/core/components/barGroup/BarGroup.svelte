<script lang="ts" generics="Key extends StringLike = string">
  /**
   * Draws the groups `barGroupLayout` computes, a `Bar` per rect. A bar
   * without a colour takes the theme's categorical colour for its key.
   */
  import { getCategoricalColor, getChartTheme } from "$lib/core/theme";
  import type { StringLike } from "$lib/types/Base";
  import type { BarGroupProps, ComputedBarGroup } from "$lib/types/Bar";
  import Group from "../Group.svelte";
  import Bar from "../shape/Bar.svelte";

  let { layout, rx, ry, top = 0, left = 0, className, children }: BarGroupProps<Key> = $props();

  const theme = getChartTheme();

  let barGroups = $derived(
    layout.map(
      (group): ComputedBarGroup<Key> => ({
        ...group,
        bars: group.bars.map((bar) => ({
          ...bar,
          color: bar.color ?? getCategoricalColor(bar.index, theme),
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
      {#each group.bars as bar (`${group.index}-${String(bar.key)}`)}
        <Bar x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill={bar.color} {rx} {ry} />
      {/each}
    {/each}
  {/if}
</Group>
