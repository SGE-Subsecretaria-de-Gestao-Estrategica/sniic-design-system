<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Builder from "$lib/builder/components/Builder.svelte";

  const { Story } = defineMeta({ title: "Builder" });
</script>

<Story name="Criar gráfico">
  {#snippet template()}
    <Builder />
  {/snippet}
</Story>
