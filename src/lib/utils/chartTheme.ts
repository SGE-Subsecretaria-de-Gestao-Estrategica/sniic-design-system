/**
 * CSS custom-property names for chart foreground theming.
 *
 * Components read these via `var(--chart-fg, <fallback>)`.
 * Consumers (or a Storybook decorator) set them on a wrapper element.
 */

export const chartVars = {
  /** Primary foreground: axis labels, tick text, legend text */
  fg: '--chart-fg',
  /** Strong foreground: titles, bold values, strong text */
  fgStrong: '--chart-fg-strong',
  /** Muted foreground: secondary labels, subtle text */
  fgMuted: '--chart-fg-muted',
  /** Grid lines */
  grid: '--chart-grid',
  /** Background peek-through (separator strokes on pies, waffles, etc.) */
  bg: '--chart-bg',
} as const;

/** Default (light background) values */
const light = {
  [chartVars.fg]: '#64748b',
  [chartVars.fgStrong]: '#000000',
  [chartVars.fgMuted]: '#555555',
  [chartVars.grid]: '#e2e8f0',
  [chartVars.bg]: '#ffffff',
};

/** Dark background values */
const dark = {
  [chartVars.fg]: '#cbd5e1',
  [chartVars.fgStrong]: '#f1f5f9',
  [chartVars.fgMuted]: '#94a3b8',
  [chartVars.grid]: 'rgba(255,255,255,0.15)',
  [chartVars.bg]: '#1e293b',
};

/** Colored background values (vibrant bg, needs light foreground) */
const onColor = {
  [chartVars.fg]: 'rgba(255,255,255,0.8)',
  [chartVars.fgStrong]: '#ffffff',
  [chartVars.fgMuted]: 'rgba(255,255,255,0.6)',
  [chartVars.grid]: 'rgba(255,255,255,0.2)',
  [chartVars.bg]: 'rgba(255,255,255,0.15)',
};

/** Light-tinted background values (pastel bg, dark foreground) */
const onLightColor = {
  [chartVars.fg]: '#475569',
  [chartVars.fgStrong]: '#1e293b',
  [chartVars.fgMuted]: '#64748b',
  [chartVars.grid]: 'rgba(0,0,0,0.1)',
  [chartVars.bg]: '#ffffff',
};

export type ThemePreset = Record<string, string>;

export const themes: Record<string, ThemePreset> = {
  light,
  cream: light,
  white: light,
  dark,
  // Base colors — vibrant backgrounds
  blue: onColor,
  orange: onColor,
  teal: onColor,
  yellow: { ...onColor, [chartVars.fg]: 'rgba(0,0,0,0.65)', [chartVars.fgStrong]: '#1e293b', [chartVars.fgMuted]: 'rgba(0,0,0,0.5)', [chartVars.grid]: 'rgba(0,0,0,0.12)', [chartVars.bg]: '#ffffff' },
  purple: onColor,
  lime: { ...onColor, [chartVars.fg]: 'rgba(0,0,0,0.65)', [chartVars.fgStrong]: '#1e293b', [chartVars.fgMuted]: 'rgba(0,0,0,0.5)', [chartVars.grid]: 'rgba(0,0,0,0.12)', [chartVars.bg]: '#ffffff' },
  red: onColor,
  lavender: { ...onLightColor },
  // Light color variants — pastel backgrounds
  'light-blue': onLightColor,
  'light-orange': onLightColor,
  'light-teal': onLightColor,
  'light-yellow': onLightColor,
  'light-purple': onLightColor,
  'light-lime': onLightColor,
  'light-red': onLightColor,
  'light-lavender': onLightColor,
};

/** Build a CSS style string from a theme preset */
export function themeToStyle(theme: ThemePreset): string {
  return Object.entries(theme).map(([k, v]) => `${k}:${v}`).join(';');
}
