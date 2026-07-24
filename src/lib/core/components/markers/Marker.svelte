<script lang="ts">
  import type { MarkerProps } from "$lib/types/Marker";

  let {
    id,
    markerWidth = 3,
    markerHeight = 3,
    markerUnits = "userSpaceOnUse",
    children,
    ...restProps
  }: MarkerProps = $props();
</script>

<defs>
  <marker {id} {markerWidth} {markerHeight} {markerUnits} {...restProps}>
    {@render children()}
  </marker>
</defs>
