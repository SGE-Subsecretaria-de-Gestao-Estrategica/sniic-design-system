export const fontFamily = "General Sans Variable"

export const fontSize = {
  sm: 9,
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
    100: '#F3EDE8',
    200: '#EBE2DD',
    300: '#CEC2BB',
  },
  neutral: {
    100: '#808679',
    200: '#4D5148',
    300: '#33382E'
  }
}

export const pillarPalettes = [
  { id: 1, primary: '#CB3328', secondary: '#2062C2', accent: '#12C9D2' },
  { id: 6, primary: '#F6B60E', secondary: '#265C4F', accent: '#D74D2A' },
]

export type PillarPalette = (typeof pillarPalettes)[number]

export const spacing = {
  md: 10
}

export const strokeWidths = {
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