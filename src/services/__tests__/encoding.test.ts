import { base64ToBytes, bytesToBase64 } from '@/services/encoding';

describe('encoding', () => {
  it('round-trips bytes through base64', () => {
    const input = new Uint8Array([0, 1, 2, 255, 128, 64, 32]);
    const encoded = bytesToBase64(input);
    const decoded = base64ToBytes(encoded);
    expect(Array.from(decoded)).toEqual(Array.from(input));
  });

  it('handles empty buffers', () => {
    expect(bytesToBase64(new Uint8Array())).toBe('');
    expect(Array.from(base64ToBytes(''))).toEqual([]);
  });

  it('handles larger payloads in chunks', () => {
    const input = new Uint8Array(100_000);
    for (let i = 0; i < input.length; i += 1) {
      input[i] = i % 256;
    }
    const decoded = base64ToBytes(bytesToBase64(input));
    expect(decoded.length).toBe(input.length);
    expect(decoded[0]).toBe(0);
    expect(decoded[255]).toBe(255);
    expect(decoded[999]).toBe(999 % 256);
  });
});
