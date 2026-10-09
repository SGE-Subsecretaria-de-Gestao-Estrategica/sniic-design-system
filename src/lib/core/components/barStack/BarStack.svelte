<script lang="ts" generics="D, K extends string = string">
  /**
   * Draws the series `barStackLayout` computes, a `Bar` per rect. A series
   * takes `color` for its key, or the theme's categorical colour for its index.
   */
  import { getCategoricalColor, getChartTheme } from "$lib/core/theme";
  import type { BarStackProps, ComputedBarStack } from "$lib/types/Bar";
  import Group from "../Group.svelte";
  import Bar from "../shape/Bar.svelte";

  let { layout, color, rx, ry, top = 0, left = 0, className, children }: BarStackProps<D, K> =
    $props();

  const theme = getChartTheme();

  let barStacks = $derived(
    layout.series.map((stack): ComputedBarStack<D, K> => {
      const fill = color?.(stack.key, stack.index) ?? getCategoricalColor(stack.index, theme);
      return { ...stack, color: fill, bars: stack.bars.map((bar) => ({ ...bar, color: fill })) };
    }),
  );
</script>

<Group class={["bar-stack", className]} {top} {left}>
  {#if children}
    {@render children({ barStacks })}
  {:else}
    {#each barStacks as stack (stack.key)}
      {#each stack.bars as bar (bar.index)}
        <Bar x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill={bar.color} {rx} {ry} />
      {/each}
    {/each}
  {/if}
</Group>
