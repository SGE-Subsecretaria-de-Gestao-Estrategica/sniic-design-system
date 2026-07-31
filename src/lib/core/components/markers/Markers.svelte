<script lang="ts" generics="Datum">
  import type { Snippet } from "svelte";
  import type { Accessor } from "$lib/types/Accessor";
  import Group from "../Group.svelte";

  type MarkerProps<Datum> = {
    x: number;
    y: number;
    placement: "START" | "MID" | "END";
    /** The datum behind this marker — for labels, titles or hit targets. */
    datum: Datum;
    index: number;
  };

  type MarkersProps<Datum> = {
    top?: number;
    left?: number;
    data?: Datum[];
    x?: Accessor<Datum, number>;
    y?: Accessor<Datum, number>;
    marker?: Snippet<[MarkerProps<Datum>]>;
  };

  let { left, top, data, x, y, marker }: MarkersProps<Datum> = $props();
</script>

{#if data}
  <Group {left} {top}>
    {#each data as d, i (i)}
      {@const placement =
        i === 0 ? "START" : i === data.length - 1 ? "END" : "MID"}
      {@render marker?.({
        x: x?.(d) ?? 0,
        y: y?.(d) ?? 0,
        placement,
        datum: d,
        index: i,
      })}
    {/each}
  </Group>
{/if}
