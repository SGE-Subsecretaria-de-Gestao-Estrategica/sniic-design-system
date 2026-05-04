export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Base colors — source of truth: src/lib/styles/tokens.css
export const blue     = '#4271b5';
export const orange   = '#ea662f';
export const teal     = '#265c4f';
export const yellow   = '#f6c341';
export const purple   = '#a44c7f';
export const lime     = '#81a72f';
export const red      = '#cb4034';
export const lavender = '#c9b6c5';
export const white    = '#fffffe';
export const black    = '#000000';

// Backward-compat aliases used by existing chart imports
export const amber     = yellow;
export const green     = lime;
export const darkGreen = teal;

// Gradient color scales — hue-varied for richer transitions (light → dark)
export const colorScales = {
  // Blue: 100 cools toward 212° → 900 deepens toward indigo (228°)
  blue:     ['#d5e4f7', '#7ba6d9', '#4271b5', '#1e3882', '#0b1540'],
  // Orange: 100 warms toward golden-yellow (35°) → 900 cools to brick-red (8°)
  orange:   ['#fde9d4', '#f5a672', '#ea662f', '#943210', '#431609'],
  // Teal: 100 opens toward mint (162°) → 900 deepens to forest teal (172°)
  teal:     ['#cce8e3', '#5aab98', '#317a68', '#265c4f', '#102a24'],
  // Yellow: 100 warms toward pale cream (52°) → 900 cools to warm brown (30°)
  yellow:   ['#fef6cc', '#fadb7b', '#f6c341', '#c27c0c', '#5c3908'],
  // Purple: 100 shifts toward lilac (312°) → 900 deepens to near-violet (303°)
  purple:   ['#f0d8ec', '#cc8eb9', '#a44c7f', '#6b2455', '#2f0f29'],
  // Lime: 100 opens toward yellow-green (85°) → 900 deepens to dark olive (68°)
  lime:     ['#e7f5c4', '#aecf62', '#81a72f', '#4a6414', '#212e07'],
  // Red: 100 shifts toward coral (12°) → 900 deepens to near-crimson (354°)
  red:      ['#fbe8e5', '#e5847a', '#cb4034', '#7f1b14', '#380b0c'],
  // Lavender: 100 lightens toward near-white (306°) → 900 deepens to dusty plum (315°)
  lavender: ['#f4eff3', '#dccad8', '#c9b6c5', '#8a6d84', '#3d2a3a'],
} as const;

// Chart palette — primary (blue) and accent (orange), ordered vivid → dark → light
export const colors = {
  primary: ['#4271b5', '#1e3882', '#0b1540', '#7ba6d9', '#d5e4f7'],
  accent:  ['#ea662f', '#943210', '#431609', '#f5a672', '#fde9d4'],
} as const;

export const typography = {
  fontFamily: "'Inter', system-ui, sans-serif",
  sizes: { xs: 10, sm: 12, md: 14, lg: 16 } as const,
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const defaultMargin: Margin = { top: 20, right: 20, bottom: 40, left: 48 };
