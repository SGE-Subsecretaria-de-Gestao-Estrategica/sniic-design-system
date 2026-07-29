<script lang="ts">
  import { DefaultTheme, getChartTheme } from "$lib/core/theme";
  import type { ChartProps } from "$lib/types/Chart";
  import Group from "./Group.svelte";
  import Svg from "./Svg.svelte";
  import Theme from "./Theme.svelte";

  let {
    width = 600,
    height = 400,
    margin,
    responsive = false,
    theme,
    ariaLabel = "Chart",
    role = "img",
    style,
    containerRef = $bindable(null),
    innerRef = $bindable(null),
    measuredWidth = $bindable(0),
    innerWidth = $bindable(0),
    innerHeight = $bindable(0),
    children,
    ...restProps
  }: ChartProps = $props();

  const inheritedTheme = getChartTheme();

  let activeTheme = $derived(theme ?? inheritedTheme ?? DefaultTheme);

  let resolvedMargin = $derived({
    ...DefaultTheme.margin,
    ...activeTheme.margin,
    ...margin,
  });

  let containerWidth = $state(0);

  let svgWidth = $derived(responsive ? containerWidth : width);

  // Nothing to lay out until the container has been measured.
  let ready = $derived(!responsive || containerWidth > 0);

  let dimensions = $derived({
    width: svgWidth,
    height,
    innerWidth: Math.max(
      0,
      svgWidth - resolvedMargin.left - resolvedMargin.right,
    ),
    innerHeight: Math.max(
      0,
      height - resolvedMargin.top - resolvedMargin.bottom,
    ),
    margin: resolvedMargin,
  });

  $effect.pre(() => {
    measuredWidth = dimensions.width;
    innerWidth = dimensions.innerWidth;
    innerHeight = dimensions.innerHeight;
  });
</script>

{#snippet plot()}
  <Svg
    bind:ref={innerRef}
    width={svgWidth}
    {height}
    {role}
    aria-label={ariaLabel}
    style={style ?? "overflow: visible;"}
    {...restProps}
  >
    <Group top={resolvedMargin.top} left={resolvedMargin.left}>
      {@render children?.(dimensions)}
    </Group>
  </Svg>
{/snippet}

<div bind:this={containerRef} bind:clientWidth={containerWidth} class="chart">
  {#if ready}
    {#if theme}
      <Theme {theme}>
        {@render plot()}
      </Theme>
    {:else}
      {@render plot()}
    {/if}
  {/if}
</div>

<style>
  .chart {
    width: 100%;
  }

  .chart :global(svg) {
    display: block;
  }
</style>
