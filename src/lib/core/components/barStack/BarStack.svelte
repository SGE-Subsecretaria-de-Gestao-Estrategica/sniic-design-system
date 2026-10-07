<script lang="ts" generics="Key extends StringLike = string">
  /**
   * Draws the series `barStackLayout` computes, a `Bar` per rect. A series
   * without a colour takes the theme's categorical colour for its index.
   */
  import { getCategoricalColor, getChartTheme } from "$lib/core/theme";
  import type { StringLike } from "$lib/types/Base";
  import type { BarStackProps, ComputedBarStack } from "$lib/types/Bar";
  import Group from "../Group.svelte";
  import Bar from "../shape/Bar.svelte";

  let { layout, rx, ry, top = 0, left = 0, className, children }: BarStackProps<Key> = $props();

  const theme = getChartTheme();

  let barStacks = $derived(
    layout.map((stack): ComputedBarStack<Key> => {
      const color = stack.color ?? getCategoricalColor(stack.index, theme);
      return { ...stack, color, bars: stack.bars.map((bar) => ({ ...bar, color: bar.color ?? color })) };
    }),
  );
</script>

<Group class={["bar-stack", className]} {top} {left}>
  {#if children}
    {@render children({ barStacks })}
  {:else}
    {#each barStacks as stack (stack.key)}
      {#each stack.bars as bar (`${String(stack.key)}-${bar.index}`)}
        <Bar x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill={bar.color} {rx} {ry} />
      {/each}
    {/each}
  {/if}
</Group>
