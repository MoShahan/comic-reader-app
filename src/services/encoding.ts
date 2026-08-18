/**
 * Binary ↔ Base64 helpers for CBZ import/extract.
 *
 * Expo FileSystem reads and writes files as Base64 strings, while `fflate`
 * works on `Uint8Array` bytes. These functions convert between the two so we
 * can unzip a CBZ and write page images to disk.
 *
 * `bytesToBase64` encodes in chunks to avoid call-stack limits on large files
 * when spreading into `String.fromCharCode`.
 */
function bytesToBase64(bytes: Uint8Array): string {
  const chunk = 0x8000;
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += chunk) {
    const slice = bytes.subarray(i, i + chunk);
    parts.push(String.fromCharCode(...slice));
  }
  return btoa(parts.join(''));
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export { bytesToBase64, base64ToBytes };
