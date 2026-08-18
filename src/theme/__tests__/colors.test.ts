import { lightColors, darkColors } from '@/theme/colors';

const REQUIRED_KEYS = [
  'bg',
  'surface',
  'text',
  'muted',
  'accent',
  'border',
  'danger',
  'success',
  'readerBg',
  'progressFill',
] as const;

describe('theme colors', () => {
  it('light theme exposes required tokens', () => {
    for (const key of REQUIRED_KEYS) {
      expect(lightColors[key]).toMatch(/^#|^rgba/);
    }
  });

  it('dark theme exposes required tokens', () => {
    for (const key of REQUIRED_KEYS) {
      expect(darkColors[key]).toMatch(/^#|^rgba/);
    }
  });

  it('keeps light and dark key parity', () => {
    expect(Object.keys(lightColors).sort()).toEqual(Object.keys(darkColors).sort());
  });
});
