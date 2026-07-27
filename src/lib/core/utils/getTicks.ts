import type { AnyD3Scale, ScaleInput } from "$lib/types/Scale";

export default function getTicks<Scale extends AnyD3Scale>(
  scale: Scale,
  numTicks?: number,
): ScaleInput<Scale>[] {
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