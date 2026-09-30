import { resolveSpacing } from "./defaults";
import { distributeHeights } from "./geometry";
import type {
  PanelGap,
  PanelSpec,
  StackedPanel,
  StackPanelsLayout,
  StackPanelsLayoutConfig,
} from "./types";

/**
 * Stacks panels (e.g. a line chart over a bubble row) in a plotting area of
 * `height`, with a `gap` between them for captions. The only function that
 * reads the config.
 */
export function stackPanelsLayout(
  specs: readonly PanelSpec[],
  config: StackPanelsLayoutConfig,
): StackPanelsLayout {
  const { gap } = resolveSpacing(config);
  const heights = distributeHeights(
    specs,
    config.height - gap * Math.max(0, specs.length - 1),
  );

  let top = 0;
  const panels: StackedPanel[] = specs.map((spec, index) => {
    const panel = { key: spec.key, index, top, height: heights[index], bottom: top + heights[index] };
    top = panel.bottom + gap;
    return panel;
  });

  const gaps: PanelGap[] = panels.slice(0, -1).map((p) => ({
    index: p.index,
    top: p.bottom,
    height: gap,
    cy: p.bottom + gap / 2,
  }));

  return {
    panels,
    gaps,
    byKey: Object.fromEntries(panels.map((p) => [p.key, p])),
    width: config.width,
    height: config.height,
  };
}
