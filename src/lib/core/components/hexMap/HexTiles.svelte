<script lang="ts">
  import * as d3 from "d3";
  import resolveValue from "$lib/core/utils/resolveValue";
  import type { HexTilesProps } from "$lib/types/HexMap";
  import Group from "../Group.svelte";

  let {
    tiles,
    pathData,
    class: className,
    fill,
    stroke,
    strokeWidth,
  }: HexTilesProps = $props();

  const regions = $derived(d3.groups([...tiles], (tile) => tile.region));
</script>

<Group class={["hex-tiles", className]}>
  {#each regions as [region, regionTiles] (region)}
    <Group class="hex-tiles__region" data-region={region}>
      {#each regionTiles as tile (tile.ufCode)}
        <path
          transform="translate({tile.position.x},{tile.position.y})"
          d={pathData}
          fill={resolveValue(fill, tile)}
          stroke={resolveValue(stroke, tile)}
          stroke-width={strokeWidth}
        />
      {/each}
    </Group>
  {/each}
</Group>
