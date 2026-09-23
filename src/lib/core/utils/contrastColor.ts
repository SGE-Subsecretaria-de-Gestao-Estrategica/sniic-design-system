/**
 * Picks whichever of two ink colors reads with more contrast against a
 * background — using the WCAG 2.x relative-luminance formula (sRGB gamma
 * correction, then the (L1 + 0.05) / (L2 + 0.05) contrast-ratio equation),
 * not a plain-luma heuristic.
 *
 * `$lib/utils/colorContrast.ts`'s `getContrastColor` already does a
 * lighter-weight version of this (ITU-R BT.601 luma, single threshold) and
 * is what most of the design system already draws against; this one exists
 * for charts that measure contrast against *two specific* candidate inks
 * (not just black/white) — e.g. white text vs. a chart's own dark "ink"
 * token, which is rarely pure black. The two algorithms agree almost
 * everywhere; they only diverge right at the threshold.
 */

const CHANNEL_GAMMA = (c: number) =>
  c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

/** WCAG relative luminance of a hex color (`#rgb`, `#rrggbb`, alpha ignored). */
export function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.slice(0, 6);
  const n = parseInt(full, 16);
  const r = CHANNEL_GAMMA(((n >> 16) & 255) / 255);
  const g = CHANNEL_GAMMA(((n >> 8) & 255) / 255);
  const b = CHANNEL_GAMMA((n & 255) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colors — always ≥ 1, symmetric. */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (p, q) => q - p,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Whichever of `light`/`dark` contrasts more against `background`.
 *
 * @example
 * pickContrastInk('#a44c7f') // → '#FFFFFF' — a mid-tone purple fill
 * pickContrastInk('#f6c341', { dark: '#2F2F2B' }) // → '#2F2F2B' — a chart's own ink token, not pure black
 */
export function pickContrastInk(
  background: string,
  { light = "#FFFFFF", dark = "#000000" }: { light?: string; dark?: string } = {},
): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark)
    ? light
    : dark;
}
