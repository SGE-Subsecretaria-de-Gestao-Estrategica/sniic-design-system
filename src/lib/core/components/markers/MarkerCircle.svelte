<script lang="ts">
  import type { MarkerComponentProps } from "$lib/types/Marker";
  import Marker from "./Marker.svelte";

  let {
    id,
    size: radius = 9,
    strokeWidth = 1,
    ...restProps
  }: MarkerComponentProps = $props();

  let diameter = $derived(radius * 2);
  let bounds = $derived(diameter + strokeWidth);
  let mid = $derived(bounds / 2);
</script>

<Marker
  {id}
  markerWidth={bounds}
  markerHeight={bounds}
  refX={mid}
  refY={mid}
  orient="auto-start-reverse"
  markerUnits="strokeWidth"
  stroke-width={strokeWidth}
  {...restProps}
>
  <circle r={radius} cx={mid} cy={mid} />
</Marker>
