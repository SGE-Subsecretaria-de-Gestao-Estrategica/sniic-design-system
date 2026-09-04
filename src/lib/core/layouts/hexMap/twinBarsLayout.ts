import * as d3 from "d3";
import type { MapTile, Point2D, TwinBarDatum, TwinBarItem, TwinBarsLayoutConfig } from "./types";
import { baseLayout } from "./baseLayout";

const BAR_WIDTH = 20;
const BAR_GAP = 2;
const BAR_BASIS_OFFSET_K = 0.45;
const BAR_HEIGHT_K = 0.8;
const THRESHOLD_LINE_OFFSET = 6;

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
  config: Pick<TwinBarsLayoutConfig<D>, "getUf" | "getValue" | "getType" | "width" | "gap" | "threshold">,
  yScale: d3.ScaleLinear<number, number>,
  origin: Point2D,
): TwinBarItem<D> {
  const { getUf, getValue, getType, width = BAR_WIDTH, gap = BAR_GAP, threshold = 0 } = config;

  const value = getValue(item);
  const { fullHeight, segments, isOverThreshold } = computeBarSegments(value, threshold, yScale);

  const x = origin.x + index * (width + gap);
  const y = origin.y - fullHeight;

  return {
    key: `${getType(item)}-${getUf(item)}`,
    value,
    data: item,
    x,
    y,
    width,
    height: fullHeight,
    segments,
    isOverThreshold,
  };
}

function getThresholdInterval(origin: Point2D, totalWidth: number, threshold: number, thresholdHeight: number) {
  if (threshold <= 0) return undefined;
  const y = origin.y - thresholdHeight;
  return {
    from: { x: origin.x - THRESHOLD_LINE_OFFSET, y },
    to: { x: origin.x + totalWidth + THRESHOLD_LINE_OFFSET, y },
  };
}

function makeTwinBars<D>(
  tile: MapTile,
  ufCode: string,
  items: D[],
  config: TwinBarsLayoutConfig<D>,
  yScale: d3.ScaleLinear<number, number>,
  thresholdHeight: number
): TwinBarDatum<D> {
  const { width = BAR_WIDTH, gap = BAR_GAP, threshold = 0 } = config;

  const totalWidth = items.length * width + (items.length - 1) * gap;
  const origin = { x: -totalWidth / 2, y: config.radius * BAR_BASIS_OFFSET_K}

  const bars = items.map((item, index) =>
    makeBarItem(item, index, config, yScale, origin)
  );

  return {
    ...tile,
    ufCode,
    bars,
    totalWidth,
    origin,
    threshold: getThresholdInterval(origin, totalWidth, threshold, thresholdHeight),
    data: items,
  };
}

export function twinBarsLayout<D>(
  raw: D[],
  config: TwinBarsLayoutConfig<D>
) {
  const { radius, offsetK = 0, getUf, getValue, threshold = 0 } = config;

  const layout = baseLayout(raw, { getUf, radius, offsetK });

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(raw, getValue) ?? 0])
    .range([0, radius * BAR_HEIGHT_K]);

  const thresholdHeight = yScale(threshold);

  const twinBarData: TwinBarDatum<D>[] = [];
  for (const [uf, items] of d3.group(raw, getUf).entries()) {
    const tile = layout.tiles.get(uf);
    if (!tile) continue;

    const bars = makeTwinBars(tile, uf, items, config, yScale, thresholdHeight)
    twinBarData.push(bars);
  }

  return {
    tiles: layout.tiles,
    pathData: layout.pathData,
    yScale,
    thresholdHeight,
    data: twinBarData,
  };
}
