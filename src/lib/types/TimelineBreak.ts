export type TimelineBreakProps = {
  x: number;
  /** Y of the time axis; the chevron sits just above it. */
  axisY: number;
  /** Defaults to the theme's `timelineBreak.label`. */
  label?: string;
  /** Colour of the label and the chevron. Defaults to the theme's `timelineBreak.stroke` and `breakLabel` text role. */
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  letterSpacing?: number | string;
  /** Scales the chevron glyph and its gap from the axis and the label. Defaults to the theme's `timelineBreak.size`. */
  size?: number;
};
