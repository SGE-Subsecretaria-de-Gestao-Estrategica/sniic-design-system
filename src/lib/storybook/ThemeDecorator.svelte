<script lang="ts">
  import { themes, themeToStyle } from '../utils/chartTheme.js';

  /** Storybook injects the current globals via `globals` prop. */
  interface Props {
    /** @deprecated — Storybook's old slot API passes children as a slot */
    globals?: { backgrounds?: { value?: string } };
  }

  let { globals }: Props = $props();

  const themeName = $derived(globals?.backgrounds?.value ?? 'light');
  const style = $derived(themeToStyle(themes[themeName] ?? themes.light));
</script>

<div style={style}>
  <slot />
</div>
