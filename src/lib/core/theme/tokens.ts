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
  secondary: '#2B4AD2',
  secondaryVariant: '#6279E2',
  accent: '#31C6D3',
} as const

export const eixo2Palette = {
  primary: '#317857',
  primaryVariant: '#38A879',
  secondary: '#E5582D',
  secondaryVariant: '#E69F49',
  accent: '#2747E5',
} as const

export const eixo3Palette = {
  primary: '#9D3877',
  primaryVariant: '#AE66CC',
  secondary: '#94BC3E',
  secondaryVariant: '#539A24',
  accent: '#E83407',
} as const

export const eixo4Palette = {
  primary: '#2062C2',
  primaryVariant: '#2C0BA2',
  secondary: '#2EAC69',
  secondaryVariant: '#61D04E',
  accent: '#FA6B05',
} as const

export const eixo5Palette = {
  primary: '#F07A25',
  primaryVariant: '#CF4E4E',
  secondary: '#4888C2',
  secondaryVariant: '#36539D',
  accent: '#AA33E6',
} as const

export const eixo6Palette = {
  primary: '#F6B60E',
  primaryVariant: '#F68E0E',
  secondary: '#265C4F',
  secondaryVariant: '#3D9142',
  accent: '#D74D2A',
} as const

export const eixo7Palette = {
  primary: '#81A72E',
  primaryVariant: '#0A8140',
  secondary: '#E75C52',
  secondaryVariant: '#FB7B9D',
  accent: '#2470DA',
} as const

export const eixo8Palette = {
  primary: '#592F83',
  primaryVariant: '#CC39DF',
  secondary: '#2B6DCD',
  secondaryVariant: '#44ADEE',
  accent: '#57C712',
} as const

/** Paletas por eixo, indexadas pelo número do eixo. */
export const eixoPalettes = {
  1: eixo1Palette,
  2: eixo2Palette,
  3: eixo3Palette,
  4: eixo4Palette,
  5: eixo5Palette,
  6: eixo6Palette,
  7: eixo7Palette,
  8: eixo8Palette,
} as const

/**
 * Boletins da LPG — cada um dos quatro capítulos veste a paleta de um eixo do
 * Cultura em Números.
 */
export const lpgCapituloEixo = {
  1: 2,
  2: 3,
  3: 5,
  4: 6,
} as const

/** Paletas dos capítulos da LPG, indexadas pelo número do capítulo. */
export const lpgPalettes = {
  1: eixo2Palette,
  2: eixo3Palette,
  3: eixo5Palette,
  4: eixo6Palette,
} as const

/** O eixo cujo tema é o padrão quando nenhum é pedido. */
export const defaultEixo = 6

export const pillarPalettes = [
  { id: 1, name: "Eixo 1", ...eixo1Palette },
  { id: 2, name: "Eixo 2", ...eixo2Palette },
  { id: 3, name: "Eixo 3", ...eixo3Palette },
  { id: 4, name: "Eixo 4", ...eixo4Palette },
  { id: 5, name: "Eixo 5", ...eixo5Palette },
  { id: 6, name: "Eixo 6", ...eixo6Palette },
  { id: 7, name: "Eixo 7", ...eixo7Palette },
  { id: 8, name: "Eixo 8", ...eixo8Palette },
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