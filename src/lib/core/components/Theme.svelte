<script lang="ts">
  import { type Snippet } from "svelte";
  import { setChartTheme } from "$lib/core/theme/context";
  import type { ChartTheme } from "$lib/core/theme/types";

  type ThemeProps = {
    theme?: ChartTheme;
    children?: Snippet;
  };

  let { theme, children }: ThemeProps = $props();

  setChartTheme(theme);
</script>

{@render children?.()}
