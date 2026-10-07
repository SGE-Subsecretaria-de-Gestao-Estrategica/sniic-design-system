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

/**
 * Cores de fundo — cartão, faixa e linha de grade. Ocupam o lugar do branco
 * em toda figura: nenhum gráfico pinta `#FFFFFF`.
 */
export const basePalette = {
  100: '#FEFFFC',
  200: '#F0F2F1',
  300: '#ECEEED',
} as const

/**
 * Tinta — do cinza dos rótulos secundários ao quase-preto. Ocupam o lugar do
 * preto e dos cinzas: texto, eixos, contornos e dados ausentes.
 */
export const neutralPalette = {
  100: '#808679',
  200: '#4D5148',
  300: '#2D2E2B',
  400: '#1C1C1C',
} as const

export const sharedPalette = {
  transparent: 'transparent',
  base: basePalette,
  neutral: neutralPalette,
  // TODO: dados que faltam, dados não enviados
}

export const eixo1Palette = {
  primary: '#D5362A',
  primaryVariant: '#EC6596',
  secondary: '#4B2F92',
  secondaryVariant: '#4F68DA',
  accent: '#68CF27',
} as const

export const eixo6Palette = {
  primary: '#F6B60E',
  primaryVariant: '#F68E0E',
  secondary: '#265C4F',
  secondaryVariant: '#3D9142',
  accent: '#D74D2A',
} as const

/** Paletas por eixo, indexadas pelo número do eixo. */
export const eixoPalettes = {
  1: eixo1Palette,
  6: eixo6Palette,
} as const

/** O eixo cujo tema é o padrão quando nenhum é pedido. */
export const defaultEixo = 6

export const pillarPalettes = [
  { id: 1, name: "Eixo 1", ...eixo1Palette },
  { id: 6, name: "Eixo 6", ...eixo6Palette },
  // PNAB: extraído de public/logos/pnab-logo.svg (azul dominante, verde e amarelo
  // nos blocos principais da marca). Confirme com o guia de marca oficial do PNAB
  // se houver um, antes de considerar definitivo.
  { id: 100, name: "PNAB", primary: '#173EFC', primaryVariant: '#173EFC', secondary: '#0DCB03', secondaryVariant: '#0DCB03', accent: '#FCCC02' },
]

export type PillarPalette = (typeof pillarPalettes)[number]

export const spacing = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
}

export const strokeWidth = {
  xs: 1,
  sm: 1.5,
  md: 2,
  lg: 2.5,
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