export type HighlightCalloutProps = {
  /** Already formatted — this component doesn't format numbers. */
  value: string;
  description: string;
  x: number;
  y: number;
  /** Wrap width for `description`. `value` never wraps. */
  width: number;
  /** Fill for `value`. Defaults to the theme's `calloutValue` text role. */
  color?: string;
  valueFontSize?: number;
  descriptionFontSize?: number;
  /** Fill for `description`. Defaults to the theme's `calloutDescription` text role. */
  descriptionColor?: string;
  fontFamily?: string;
  descriptionFontWeight?: string | number;
  /** Vertical gap between the value and the description's first line. Defaults to 0.55× the value's font size. */
  gap?: number;
  lineHeight?: string | number;
};
