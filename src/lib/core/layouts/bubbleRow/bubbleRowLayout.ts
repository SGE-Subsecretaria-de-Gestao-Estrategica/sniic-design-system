import * as d3 from "d3";
import resolveDomain from "$lib/core/utils/resolveDomain";
import splitAtBreaks from "$lib/core/utils/splitAtBreaks";
import { resolveSpacing } from "./defaults";
import { placeOnSide, placeRight } from "../labels";
import { areaRadius, connectRuns, createNormalizer } from "./geometry";
import { toEntries } from "./ordering";
import type {
  BubbleRowItem,
  BubbleRowLayout,
  BubbleRowLayoutConfig,
} from "./types";

/**
 * A row of proportional (area) bubbles placed along a shared x scale, with a
 * baseline cut at the axis breaks. The only function that reads the config.
 */
export function bubbleRowLayout<D>(
  data: D[],
  config: BubbleRowLayoutConfig<D>,
): BubbleRowLayout<D> {
  const spacing = resolveSpacing(config);
  const entries = toEntries(data, config.getX, config.getValue);

  const normalize = createNormalizer(
    resolveDomain(entries.map((e) => e.value), { pinned: config.valueDomain }),
  );
  const radiusOf =
    config.radius ??
    ((value: number) => areaRadius(normalize(value), spacing.minRadius, spacing.maxRadius));

  const sized = entries.map((e) => ({ ...e, t: normalize(e.value), radius: radiusOf(e.value) }));
  const centerY = d3.max(sized, (e) => e.radius) ?? 0;
  const endLabel = config.endLabel ?? true;

  const items = sized.map((entry, index): BubbleRowItem<D> => {
    const x = config.xScale(entry.xValue);
    const isLast = index === sized.length - 1;
    const top = { x, y: centerY - entry.radius };
    return {
      ...entry,
      key: String(+entry.xValue),
      index,
      x,
      y: centerY,
      isLast,
      // End label: right of the bubble, hanging from just above its top.
      label:
        isLast && endLabel
          ? placeRight(top, entry.radius + spacing.endLabelGap, -spacing.labelGap)
          : placeOnSide(top, "above", spacing.labelGap),
    };
  });

  const { baseline, bridges } = connectRuns(
    splitAtBreaks(items, config.breaks ?? []),
    centerY,
  );

  return {
    items,
    baseline,
    bridges,
    centerY,
    width: config.width,
    height: 2 * centerY,
  };
}
