export const colors = {
  background: '#06111F',
  backgroundSecondary: '#0C1728',
  backgroundTertiary: '#12233A',
  surface: 'rgba(255, 255, 255, 0.08)',
  surfaceStrong: '#13233A',
  surfaceMuted: '#0E1B2E',
  border: 'rgba(255, 255, 255, 0.12)',
  borderStrong: 'rgba(255, 255, 255, 0.22)',
  text: '#F4F7FB',
  textMuted: '#A5B3C7',
  textSoft: '#D7E0EA',
  accent: '#7C5CFF',
  accentSecondary: '#20D3FF',
  success: '#27D69B',
  warning: '#FFB84D',
  danger: '#FF6B7A',
  gold: '#F7D774',
  white: '#FFFFFF',
  black: '#02060D'
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40
};

export const radii = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999
};

export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 16
  },
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10
  }
};

export const categoryMeta = {
  vehicles: { icon: '🚗', label: 'ยานพาหนะ', accent: '#FF7A59' },
  animals: { icon: '🐘', label: 'สัตว์', accent: '#3CD3B2' },
  musical_instruments: { icon: '🎸', label: 'เครื่องดนตรี', accent: '#A56DFF' }
};

export const difficultyMeta = {
  easy: { icon: '✨', label: 'Easy', accent: colors.success },
  hard: { icon: '🔥', label: 'Hard', accent: colors.danger }
};
