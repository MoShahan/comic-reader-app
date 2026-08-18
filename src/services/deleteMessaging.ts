import type { DeleteResult } from '@/types/comic';

/** User-facing follow-up after delete; null means no extra alert needed. */
export function buildDeleteUserMessage(result: DeleteResult): string | null {
  if (!result.appDeleted) {
    return 'Comic not found';
  }
  if (result.deviceDeleted) {
    return null;
  }
  // App-only deletes intentionally leave the device file - no follow-up.
  if (!result.deviceDeleteError) {
    return null;
  }
  return result.deviceDeleteError;
}
