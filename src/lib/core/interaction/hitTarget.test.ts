import { describe, expect, it, vi } from "vitest";
import { hitRadius, hitTargetHandlers } from "./hitTarget";
import type { HoverState } from "./hover.svelte.js";

describe("hitRadius", () => {
  it("never shrinks below half the minimum size", () => {
    expect(hitRadius(4, 24)).toBe(12);
    expect(hitRadius(20, 24)).toBe(24);
  });
});

describe("hitTargetHandlers", () => {
  const fakeHover = () => ({ set: vi.fn(), clear: vi.fn() }) as unknown as HoverState & {
    set: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  it("tracks the pointer relative to the container", () => {
    const hover = fakeHover();
    const container = { getBoundingClientRect: () => ({ left: 100, top: 50 }) } as HTMLElement;
    const handlers = hitTargetHandlers(hover, 3, () => container);
    handlers.onpointermove({ clientX: 130, clientY: 70 } as PointerEvent);
    expect(hover.set).toHaveBeenCalledWith(3, 30, 20);
  });

  it("clears on Escape only", () => {
    const hover = fakeHover();
    const handlers = hitTargetHandlers(hover, 0, () => null);
    handlers.onkeydown({ key: "Enter" } as KeyboardEvent);
    expect(hover.clear).not.toHaveBeenCalled();
    handlers.onkeydown({ key: "Escape" } as KeyboardEvent);
    expect(hover.clear).toHaveBeenCalledOnce();
  });

  it("anchors keyboard focus at the origin without a container", () => {
    const hover = fakeHover();
    hitTargetHandlers(hover, 1, () => null).onfocus({ currentTarget: null } as unknown as FocusEvent);
    expect(hover.set).toHaveBeenCalledWith(1, 0, 0, true);
  });
});
