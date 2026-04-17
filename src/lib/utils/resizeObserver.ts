import { onMount } from 'svelte';

/**
 * Sets up a ResizeObserver on the element returned by `getEl`,
 * calling `callback` on every resize. Cleans up on component destroy.
 *
 * Must be called synchronously during component initialization.
 */
export function useResizeObserver(
  getEl: () => Element | null | undefined,
  callback: () => void,
): void {
  onMount(() => {
    const el = getEl();
    if (!el) return;
    const ro = new ResizeObserver(() => callback());
    ro.observe(el);
    return () => ro.disconnect();
  });
}
