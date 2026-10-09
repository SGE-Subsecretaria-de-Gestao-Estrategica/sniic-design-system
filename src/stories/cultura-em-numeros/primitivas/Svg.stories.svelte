<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Svg from "$lib/core/components/Svg.svelte";

  const { Story } = defineMeta({
    title: "Cultura em Números/Primitivas/Svg",
    globals: { backgrounds: { value: "cultnum-bg" } },
    component: Svg,
    tags: [],
  });
</script>

<Story name="Default">
  {#snippet template()}
    <Svg width={500} height={500} style="border: 1px solid #ECEEED;"></Svg>
  {/snippet}
</Story>
