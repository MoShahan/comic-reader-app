import { buildDeleteUserMessage } from '@/services/deleteMessaging';

describe('buildDeleteUserMessage', () => {
  it('returns null when both app and device deletes succeed', () => {
    expect(buildDeleteUserMessage({ appDeleted: true, deviceDeleted: true })).toBeNull();
  });

  it('surfaces device failure after successful app delete', () => {
    expect(
      buildDeleteUserMessage({
        appDeleted: true,
        deviceDeleted: false,
        deviceDeleteError: 'permission denied',
      }),
    ).toBe('permission denied');
  });

  it('reports missing comic', () => {
    expect(buildDeleteUserMessage({ appDeleted: false, deviceDeleted: false })).toBe(
      'Comic not found',
    );
  });

  it('uses fallback when device delete fails without message', () => {
    expect(buildDeleteUserMessage({ appDeleted: true, deviceDeleted: false })).toBeNull();
  });
});
