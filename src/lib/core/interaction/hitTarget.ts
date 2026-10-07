import type { Point } from "$lib/core/layouts/types";
import type { HoverState } from "./hover.svelte.js";

// Pure helpers behind `HitTarget`, shared by its circle, rect and path forms.

/** Radius of a round target: the mark's radius plus a margin, never under `minSize` across. */
export function hitRadius(r: number, minSize: number) {
  return Math.max(r + 4, minSize / 2);
}

/** The pointer's position relative to `container`'s top-left; the origin without one. */
export function pointerIn(event: PointerEvent, container: HTMLElement | null): Point {
  if (!container) return { x: 0, y: 0 };
  const bounds = container.getBoundingClientRect();
  return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
}

/** Where a focused target anchors its tooltip: its top centre, relative to `container`. */
export function focusAnchor(target: Element | null, container: HTMLElement | null): Point {
  if (!target || !container) return { x: 0, y: 0 };
  const bounds = target.getBoundingClientRect();
  const host = container.getBoundingClientRect();
  return { x: bounds.left - host.left + bounds.width / 2, y: bounds.top - host.top };
}

/**
 * Pointer and keyboard handlers that drive `hover` for the mark at `index`.
 * `container` is read on each event, so it may bind late.
 */
export function hitTargetHandlers(
  hover: HoverState,
  index: number,
  container: () => HTMLElement | null,
) {
  const track = (event: PointerEvent) => {
    const point = pointerIn(event, container());
    hover.set(index, point.x, point.y);
  };
  return {
    onpointerenter: track,
    onpointermove: track,
    onpointerleave: () => hover.clear(),
    onfocus: (event: FocusEvent) => {
      const point = focusAnchor(event.currentTarget as Element | null, container());
      hover.set(index, point.x, point.y, true);
    },
    onblur: () => hover.clear(),
    onkeydown: (event: KeyboardEvent) => {
      if (event.key === "Escape") hover.clear();
    },
  };
}
