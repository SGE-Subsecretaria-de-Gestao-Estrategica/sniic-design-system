import * as d3 from "d3";
import resolveDomain from "$lib/core/utils/resolveDomain";
import { placeOnSide } from "../labels";
import { resolveSpacing } from "./defaults";
import { createValueScale, stemRect } from "./geometry";
import { toEntries } from "./ordering";
import type {
  DifferenceStem,
  DifferenceStemsLayout,
  DifferenceStemsLayoutConfig,
} from "./types";


export function differenceStemsLayout<D>(
  data: D[],
  config: DifferenceStemsLayoutConfig<D>,
): DifferenceStemsLayout<D> {
  const spacing = resolveSpacing(config);
  const cornerRadius = config.cornerRadius ?? spacing.stemWidth / 2;
  const endLabel = config.endLabel ?? true;

  const entries = toEntries(
    data,
    config.getX,
    config.getSeries,
    config.getValue,
    config.minuend,
    config.subtrahend,
  );

  const values = entries.map((e) => e.value);
  const pinned: [number, number] | undefined =
    config.maxValue === undefined
      ? undefined
      : [(d3.min(values) ?? 0) < 0 ? -config.maxValue : 0, config.maxValue];
  const valueScale = createValueScale(
    resolveDomain(values, { pinned, includeZero: true, headroom: spacing.valueHeadroom }),
    config.height,
  );
  const baselineY = valueScale(0);

  const stems = entries.map((entry, index): DifferenceStem<D> => {
    const x = config.xScale(entry.xValue);
    const tip = { x, y: valueScale(entry.value) };
    const sign = Math.sign(entry.value) as DifferenceStem<D>["sign"];
    const isLast = index === entries.length - 1;
    const side = sign < 0 ? "below" : "above";
    return {
      ...entry,
      key: String(+entry.xValue),
      index,
      x,
      sign,
      isLast,
      rect: stemRect(x, baselineY, tip.y, spacing.stemWidth),
      cornerRadius,
      tip,
      label:
        isLast && endLabel
          ? placeOnSide(tip, side, spacing.labelGap, "start", spacing.endLabelGap)
          : placeOnSide(tip, side, spacing.labelGap),
    };
  });

  return { stems, valueScale, baselineY, width: config.width, height: config.height };
}
