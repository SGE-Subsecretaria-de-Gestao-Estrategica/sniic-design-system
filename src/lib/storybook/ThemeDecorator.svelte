<script lang="ts">
  import type { Snippet } from 'svelte';
  import { themes, themeToStyle } from '../utils/chartTheme.js';

  /** Storybook injects the current globals via `globals` prop. */
  interface Props {
    globals?: { backgrounds?: { value?: string } };
    children?: Snippet;
  }

  let { globals, children }: Props = $props();

  const themeName = $derived(globals?.backgrounds?.value ?? 'light');
  const style = $derived(themeToStyle(themes[themeName] ?? themes.light));
</script>

<div style={style}>
  {@render children?.()}
</div>
