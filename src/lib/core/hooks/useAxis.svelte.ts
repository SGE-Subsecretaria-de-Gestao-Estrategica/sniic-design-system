import Orientation, { type OrientationType } from "$lib/core/constants/orientation";
import Point from "$lib/entities/Point";
import type { AxisRendererProps, AxisScale, AxisScaleOutput, CommonProps, SharedAxisProps, TickFormatter } from "$lib/types/Axis";
import type { AnyD3Scale, ScaleInput } from "$lib/types/Scale";
import coerceNumber from "$lib/core/utils/coerceNumber";

const DEF_AXIS_RANGE_PADDING = 0;

export type UseAxisOptions<Scale extends AxisScale> = CommonProps<Scale> & {
  orientation?: OrientationType;
  scale: Scale;
  tickValues?: ScaleInput<Scale>[];
};

export default function useAxis<Scale extends AxisScale>({
  hideAxisLine = false,
  hideTicks = false,
  hideZero = false,
  numTicks,
  orientation = Orientation.bottom,
  rangePadding = 0,
  scale,
  tickFormat,
  tickLength = 8,
  tickValues,
  ...restProps
}: UseAxisOptions<Scale>): AxisRendererProps<Scale> {
  const format = tickFormat ?? getTickFormatter(scale);

  // A continuous scale picks a readable tick count for you; a band/point scale
  // has no such notion — its domain *is* the tick set, and thinning it silently
  // drops category labels. Opt into thinning by passing `numTicks` explicitly.
  const resolvedNumTicks =
    numTicks ??
    ('ticks' in (scale as AnyD3Scale) ? 10 : (scale as AnyD3Scale).domain().length);

  const isLeft = orientation === Orientation.left;
  const isTop = orientation === Orientation.top;
  const horizontal = isTop || orientation === Orientation.bottom;

  const tickPosition = getTickPositionFactory(scale);
  const tickSign = isLeft || isTop ? -1 : 1;

  const range = scale.range();
  const rangePaddingConfig = getAxisRangePaddingConfig(rangePadding);

  const axisFromPoint = createPoint(
    { x: Number(range[0]) + 0.5 - rangePaddingConfig.start, y: 0 },
    horizontal,
  );
  const axisToPoint = createPoint(
    { x: Number(range[range.length - 1]) + 0.5 + rangePaddingConfig.end, y: 0 },
    horizontal,
  );

  const filteredTickValues = (tickValues ?? getTicks(scale, resolvedNumTicks))
    .filter((value) => !hideZero || (value !== 0 && value !== '0'))
    .map((value, index) => ({ value, index }));

  const ticks = filteredTickValues.map(({ value, index }) => {
    const scaledValue = coerceNumber(tickPosition(value));

    return {
      value,
      index,
      from: createPoint({ x: scaledValue, y: 0 }, horizontal),
      to: createPoint({ x: scaledValue, y: tickLength * tickSign }, horizontal),
      formattedValue: format(value, index, filteredTickValues),
    };
  });

  return {
    ...restProps,
    axisFromPoint,
    axisToPoint,
    hideAxisLine,
    hideTicks,
    hideZero,
    horizontal,
    numTicks: resolvedNumTicks,
    orientation,
    rangePadding,
    scale,
    tickFormat: format,
    tickLength,
    tickPosition,
    tickSign,
    ticks,
  };
}


function getTickFormatter<Scale extends AxisScale>(scale: Scale) {
  const s = scale as AxisScale;
  const hasTickFmt = 'tickFormat' in s
  if (hasTickFmt) return s.tickFormat() as TickFormatter<ScaleInput<Scale>>;
  // Band/point scales have no tickFormat. A bare `toString` here resolves to
  // the global one, which stringifies its *receiver* — hence the
  // "[object Undefined]" labels every band axis used to render.
  return ((value: unknown) => String(value)) as TickFormatter<ScaleInput<Scale>>;
}

function getTickPositionFactory<Scale extends AxisScale>(
  scale: Scale,
  align: 'start' | 'center' | 'end' = 'center',
) {
  const s = scale as AxisScale;
  const needsOffset = align !== 'start' && 'bandwidth' in s;  
  if (needsOffset) {
    let offset = s.bandwidth();
    if (align === 'center') offset /= 2;
    if (s.round()) offset = Math.round(offset);
    return (d: ScaleInput<Scale>) => {
      const scaledValue = s(d);
      return typeof scaledValue === 'number' ? scaledValue + offset : scaledValue;
    };
  }

  return scale as (d: ScaleInput<Scale>) => AxisScaleOutput;
}

function getAxisRangePaddingConfig(
  originalRangePadding: SharedAxisProps<never>['rangePadding'] = DEF_AXIS_RANGE_PADDING,
) {
  return typeof originalRangePadding === 'number'
    ? { start: originalRangePadding, end: originalRangePadding }
    : { start: DEF_AXIS_RANGE_PADDING, end: DEF_AXIS_RANGE_PADDING, ...originalRangePadding };
}

function createPoint({ x, y }: Partial<Point>, horizontal: boolean) {
  return new Point(horizontal ? { x, y } : { x: y, y: x });
}

function getTicks<Scale extends AnyD3Scale>(
  scale: Scale,
  numTicks?: number,
): ScaleInput<Scale>[] {
  // Because `Scale` is generic type which maybe a subset of AnyD3Scale
  // that may not have `ticks` field,
  // TypeScript will not let us do the `'ticks' in scale` check directly.
  // Have to manually cast and expand type first.
  const s = scale as AnyD3Scale;

  if ('ticks' in s) return s.ticks(numTicks);

  return s
    .domain()
    .filter(
      (_, index, arr) =>
        numTicks == null ||
        arr.length <= numTicks ||
        index % Math.round((arr.length - 1) / numTicks) === 0,
    );
}