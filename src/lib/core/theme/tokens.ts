export const fontFamily = "General Sans Variable"

export const fontSize = {
  xs: 9,
  sm: 10.5,
  md: 12,
  lg: 16,
}

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}

export const sharedPalette = {
  transparent: 'transparent',
  base: {
    100: '#FEFFFC',
    200: '#F0F2F1',
    300: '#ECEEED',
  },
  neutral: {
    100: '#808679',
    200: '#4D5148',
    300: '#2D2E2B',
    400: '#1C1C1C'
  },
  // TODO: dados que faltam, dados não enviados
}

export const pillarPalettes = [
  { id: 1, primary: '#CB3328', primaryVariant: '#CB3328', secondary: '#2062C2', secondaryVariant: '#2062C2', accent: '#12C9D2' },
  { id: 6, primary: '#F6B60E', primaryVariant: '#F68E0E', secondary: '#265C4F', secondaryVariant: '#3D9142', accent: '#D74D2A' },
]

export type PillarPalette = (typeof pillarPalettes)[number]

export const spacing = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14
}

export const strokeWidth = {
  xs: 2.5,
  sm: 4,
  md: 8,
  lg: 12,
}

export const radii = {
  none: 0,
  sm: 2,
  md: 4,
}

/** Default plotting-area insets, leaving room for a bottom and a left axis. */
export const defaultMargin = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 48,
}