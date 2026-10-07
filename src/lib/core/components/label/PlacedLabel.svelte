<script lang="ts">
  import type { PlacedLabelProps } from "$lib/types/PlacedLabel";
  import Text from "../Text.svelte";

  let {
    placement,
    text,
    variant,
    left = 0,
    top = 0,
    ...style
  }: PlacedLabelProps = $props();
</script>

<Text
  {variant}
  dx={left + placement.x}
  dy={top + placement.y}
  textAnchor={placement.textAnchor}
  verticalAnchor={placement.verticalAnchor}
  {text}
  {...style}
/>
