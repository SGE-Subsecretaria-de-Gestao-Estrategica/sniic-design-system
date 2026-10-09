/** The span a scale's range covers, whichever way it runs. */
export default function rangeSpan(scale: { range(): number[] }): number {
  const range = scale.range();
  return range.length ? Math.abs(range[range.length - 1] - range[0]) : 0;
}
