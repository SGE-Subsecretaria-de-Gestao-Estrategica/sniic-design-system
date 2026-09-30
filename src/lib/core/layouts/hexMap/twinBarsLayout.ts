import * as d3 from "d3";
import resolveDomain from "$lib/core/utils/resolveDomain";
import type { Point } from "../types";
import type {
  MapTile,
  ThresholdLine,
  TwinBarDatum,
  TwinBarItem,
  TwinBarsLayout,
  TwinBarsLayoutConfig,
  TwinBarsSpacing,
} from "./types";
import { baseLayout } from "./baseLayout";
import { placeOnSide, placeRight } from "../labels";
import { resolveTwinBarsSpacing } from "./defaults";

function computeBarSegments(value: number, threshold: number, yScale: d3.ScaleLinear<number, number>) {
  const fullHeight = yScale(value);
  const isOverThreshold = Boolean(threshold && value > threshold);

  const baseValue = isOverThreshold ? threshold : value;
  const baseHeight = yScale(baseValue);
  const overflowHeight = fullHeight - baseHeight;

  const segments = [{ y: overflowHeight, height: baseHeight }];
  if (isOverThreshold) {
    segments.push({ y: 0, height: overflowHeight });
  }

  return { fullHeight, segments, isOverThreshold };
}

function makeBarItem<D>(
  item: D,
  index: number,
  config: TwinBarsLayoutConfig<D>,
  spacing: TwinBarsSpacing,
  yScale: d3.ScaleLinear<number, number>,
  origin: Point,
): TwinBarItem<D> {
  const { barWidth: width, barGap: gap } = spacing;
  const value = config.getValue(item);
  const { fullHeight, segments, isOverThreshold } = computeBarSegments(value, config.threshold ?? 0, yScale);

  const x = origin.x + index * (width + gap);
  const y = origin.y - fullHeight;

  return {
    key: `${config.getType(item)}-${config.getUf(item)}`,
    index,
    value,
    data: item,
    x,
    y,
    width,
    height: fullHeight,
    segments,
    isOverThreshold,
    label: placeOnSide({ x: x + width / 2, y: origin.y }, "below", spacing.valueLabelGap),
  };
}

function getThresholdInterval(
  origin: Point,
  totalWidth: number,
  threshold: number,
  thresholdHeight: number,
  overhang: number,
): ThresholdLine | undefined {
  if (threshold <= 0) return undefined;
  const y = origin.y - thresholdHeight;
  return {
    from: { x: origin.x - overhang, y },
    to: { x: origin.x + totalWidth + overhang, y },
  };
}

/** UF name hanging from the tile's top-left corner. */
function placeUfName(radius: number, spacing: TwinBarsSpacing) {
  const corner = -radius * spacing.nameCornerRatio;
  return placeRight({ x: corner, y: corner }, spacing.nameLabelInset);
}

function makeTwinBars<D>(
  tile: MapTile,
  index: number,
  items: D[],
  config: TwinBarsLayoutConfig<D>,
  spacing: TwinBarsSpacing,
  yScale: d3.ScaleLinear<number, number>,
  thresholdHeight: number
): TwinBarDatum<D> {
  const { barWidth: width, barGap: gap } = spacing;
  const totalWidth = items.length * width + (items.length - 1) * gap;
  const origin = { x: -totalWidth / 2, y: config.radius * spacing.barBaseRatio };

  return {
    ...tile,
    key: tile.ufCode,
    index,
    bars: items.map((item, i) => makeBarItem(item, i, config, spacing, yScale, origin)),
    totalWidth,
    origin,
    threshold: getThresholdInterval(origin, totalWidth, config.threshold ?? 0, thresholdHeight, spacing.thresholdOverhang),
    nameLabel: placeUfName(config.radius, spacing),
    data: items,
  };
}

/** Per UF tile, side-by-side bars (one per type) with an optional threshold. */
export function twinBarsLayout<D>(
  raw: D[],
  config: TwinBarsLayoutConfig<D>
): TwinBarsLayout<D> {
  const spacing = resolveTwinBarsSpacing(config);
  const { radius, offsetK = 0, getUf, threshold = 0 } = config;

  const layout = baseLayout(raw, { getUf, radius, offsetK });

  const yScale = d3.scaleLinear()
    .domain(resolveDomain(raw.map(config.getValue), { includeZero: true }))
    .range([0, radius * spacing.barHeightRatio]);

  const thresholdHeight = yScale(threshold);

  const twinBarData: TwinBarDatum<D>[] = [];
  for (const [uf, items] of d3.group(raw, getUf).entries()) {
    const tile = layout.tiles.get(uf);
    if (!tile) continue;
    twinBarData.push(
      makeTwinBars(tile, twinBarData.length, items, config, spacing, yScale, thresholdHeight),
    );
  }

  return {
    tiles: layout.tiles,
    pathData: layout.pathData,
    yScale,
    thresholdHeight,
    data: twinBarData,
    width: layout.width,
    height: layout.height,
  };
}
