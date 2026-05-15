export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Base colors
export const blue     = '#4271b5';
export const orange   = '#ea662f';
export const teal     = '#265c4f';
export const yellow   = '#f6c341';
export const purple   = '#a44c7f';
export const lime     = '#81a72f';
export const red      = '#cb4034';
export const lavender = '#c9b6c5';
export const white    = '#fffffe';
export const cream    = '#ffffdeff';
export const black    = '#000000ff';

// Backward-compat aliases used by existing chart imports
export const amber     = yellow;
export const green     = lime;
export const darkGreen = teal;

// Gradient color scales — bezier-eased lightness in OKLCH (light → dark)
// Lightness follows a power-1.5 S-curve: gentle steps at extremes, larger steps mid-range.
export const colorScales = {
  blue:     ['#d5e4f7', '#9fbbe0', '#4271b5', '#2e4e8a', '#0b1540'],
  orange:   ['#fde9d4', '#f7bf95', '#ea662f', '#ab4723', '#431609'],
  teal:     ['#cce8e3', '#95c0b7', '#317a68', '#255c4f', '#102a24'],
  yellow:   ['#fef6cc', '#f9e6a1', '#f6c341', '#bf8e2b', '#5c3908'],
  purple:   ['#f0d8ec', '#d5a6c8', '#a44c7f', '#773561', '#2f0f29'],
  lime:     ['#e7f5c4', '#c3d992', '#81a72f', '#5d7920', '#212e07'],
  red:      ['#fbe8e5', '#efb0a6', '#cb4034', '#942c27', '#380b0c'],
  lavender: ['#f4eff3', '#e5dbe3', '#c9b6c5', '#958191', '#3d2a3a'],
} as const;

// Chart palette — primary (blue) and accent (orange), ordered vivid → dark → light
export const colors = {
  primary: ['#4271b5', '#2e4e8a', '#0b1540', '#9fbbe0', '#d5e4f7'],
  accent:  ['#ea662f', '#ab4723', '#431609', '#f7bf95', '#fde9d4'],
} as const;

export const typography = {
  fontFamily: "'Inter', system-ui, sans-serif",
  /**
   * Valores em gráficos (rótulos em barras, etc.) — neo-grotesca geométrica no espírito de
   * Clash Grotesk (Fontshare), com licença aberta: Space Grotesk (OFL, Google Fonts).
   */
  chartValueFontFamily: "'Space Grotesk', system-ui, sans-serif",
  /** Rawline — tipografia oficial do Governo Federal (Raleway com algarismos alinhados). */
  rawlineFontFamily: "'Rawline', 'Raleway', system-ui, sans-serif",
  /** Raleway — geométrica elegante, base da Rawline. */
  ralewayFontFamily: "'Raleway', system-ui, sans-serif",
  sizes: { xs: 10, sm: 12, md: 14, lg: 16 } as const,
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const defaultMargin: Margin = { top: 20, right: 20, bottom: 40, left: 48 };
