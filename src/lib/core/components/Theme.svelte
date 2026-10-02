<script lang="ts">
  import { type Snippet, untrack } from "svelte";
  import { setChartTheme } from "$lib/core/theme/context";
  import type { ChartTheme } from "$lib/core/theme/types";

  type ThemeProps = {
    theme?: ChartTheme;
    children?: Snippet;
  };

  let { theme, children }: ThemeProps = $props();

  // Context is set once at init; later changes to `theme` are not propagated.
  setChartTheme(untrack(() => theme));
</script>

{@render children?.()}
