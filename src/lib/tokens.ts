export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Colors from the Brazilian Government Design System (Padrão Digital de Governo)
// https://www.gov.br/ds/fundamentos-visuais/cores
export const colors = {
  // Primary blue family (Blue Warm Vivid)
  primary: [
    '#071d41', // 90 - darkest
    '#0c326f', // 70
    '#1351b4', // 40 - main
    '#2670e8', // 20
    '#5992ed', // 10
  ] as const,

  // Extended color families
  blue:    { 90: '#071d41', 70: '#0c326f', 40: '#1351b4', 20: '#2670e8', 10: '#5992ed' },
  green:   { 90: '#1a4731', 70: '#146c43', 40: '#168821', 20: '#2da44e', 10: '#6cc24a' },
  yellow:  { 90: '#7a4f00', 70: '#b38d00', 40: '#ffcd07', 20: '#ffe066', 10: '#fff3cd' },
  red:     { 90: '#7a1200', 70: '#b20d02', 40: '#e52207', 20: '#f2614a', 10: '#f8b8ae' },
  gold:    { 90: '#6b4c11', 70: '#936f38', 40: '#c2850c', 20: '#e5a000', 10: '#f5d680' },
  cyan:    { 90: '#093b44', 70: '#0d6b7a', 40: '#009ec1', 20: '#52b9d1', 10: '#99dce8' },
  indigo:  { 90: '#1b1e4d', 70: '#2e3391', 40: '#4a50c4', 20: '#7b82e0', 10: '#b4b8f0' },
  magenta: { 90: '#4d0022', 70: '#8c0046', 40: '#d72d79', 20: '#e87aaa', 10: '#f5c2d8' },
  orange:  { 90: '#5c1f00', 70: '#a33800', 40: '#e86f2c', 20: '#f0a57a', 10: '#f8d3b9' },
  violet:  { 90: '#2e1a47', 70: '#54278f', 40: '#7b3fe4', 20: '#a87ff0', 10: '#d5baf8' },

  // Neutral grays
  neutral: [
    '#1b1b1b', // darkest
    '#2d2e2f',
    '#565c65',
    '#71767a',
    '#a9aeb1',
    '#dfe1e2',
    '#f0f0f0',
    '#fcfcfc', // lightest
  ] as const,

  // Semantic / feedback colors
  success: '#168821', // Green Cool Vivid
  warning: '#ffcd07', // Yellow Vivid
  danger:  '#e52207', // Red Vivid
  info:    '#155bcb', // Blue Warm Vivid

  // Interactive states
  interactive: '#1351b4',
  visited:     '#0c326f',
  focus:       '#c2850c', // Gold Vivid
} as const;

export const typography = {
  fontFamily: "'Inter', system-ui, sans-serif",
  sizes: { xs: 10, sm: 12, md: 14, lg: 16 } as const,
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const defaultMargin: Margin = { top: 20, right: 20, bottom: 40, left: 48 };
