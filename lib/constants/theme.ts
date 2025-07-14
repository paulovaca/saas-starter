export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const

export type Theme = typeof THEMES[keyof typeof THEMES]

export const THEME_LABELS = {
  [THEMES.LIGHT]: 'Claro',
  [THEMES.DARK]: 'Escuro',
  [THEMES.SYSTEM]: 'Sistema'
} as const
