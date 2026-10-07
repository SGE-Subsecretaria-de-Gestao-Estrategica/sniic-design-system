import { onMount } from "svelte";

/**
 * Loads data once on mount and derives a layout from it, catching errors from
 * both steps. The loader (CSV, parsing) stays in the story; this only wires
 * the lifecycle. Call it during component initialisation.
 *
 * `compute` may return anything (one layout, or several for stacked panels).
 */
export default function useLayoutData<T, L>(
  load: () => Promise<T[]>,
  compute: (items: T[]) => L,
) {
  let items = $state<T[] | null>(null);
  let loadError = $state<string | null>(null);

  const result = $derived.by(() => {
    if (!items?.length) return null;
    try {
      return { layout: compute(items), error: null };
    } catch (e) {
      return { layout: null, error: (e as Error).message };
    }
  });

  onMount(async () => {
    try {
      items = await load();
    } catch (e) {
      loadError = (e as Error).message;
    }
  });

  return {
    get items() {
      return items;
    },
    get layout(): L | null {
      return result?.layout ?? null;
    },
    get error(): string | null {
      return loadError ?? result?.error ?? null;
    },
  };
}
