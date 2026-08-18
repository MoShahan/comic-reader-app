/**
 * Small formatting helpers for human-readable values in the UI.
 *
 * `formatBytes` turns raw byte counts (from library storage scans) into
 * labels like "1.2 MB" so Settings can show how much space comics use
 * without exposing raw numbers to the user.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
