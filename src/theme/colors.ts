export const lightColors = {
  bg: '#F3F1EC',
  surface: '#FFFFFF',
  surfaceMuted: '#EAE6DE',
  text: '#14171C',
  muted: '#6B7280',
  accent: '#C47B2D',
  accentSoft: '#F3E2C8',
  border: '#D9D3C8',
  success: '#1F8A5B',
  danger: '#C0392B',
  overlay: 'rgba(20, 23, 28, 0.55)',
  readerBg: '#0A0B0D',
  readerChrome: 'rgba(10, 11, 13, 0.82)',
  progressTrack: '#D9D3C8',
  progressFill: '#C47B2D',
};

export const darkColors = {
  bg: '#0F1115',
  surface: '#1A1D24',
  surfaceMuted: '#242833',
  text: '#F2F4F8',
  muted: '#9AA3B2',
  accent: '#E8A54B',
  accentSoft: '#3A2E1C',
  border: '#2A2F3A',
  success: '#3DDC97',
  danger: '#FF6B5C',
  overlay: 'rgba(0, 0, 0, 0.65)',
  readerBg: '#000000',
  readerChrome: 'rgba(0, 0, 0, 0.78)',
  progressTrack: '#2A2F3A',
  progressFill: '#E8A54B',
};

export type AppColors = typeof lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
} as const;
