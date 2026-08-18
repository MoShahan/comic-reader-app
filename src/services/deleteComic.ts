import * as FileSystem from 'expo-file-system/legacy';

import { deleteAllComicRows, deleteComicRow, getComicById } from '@/db/comicRepository';
import { comicRootFromPagesDir } from '@/services/paths';

import type { DeleteResult } from '@/types/comic';

async function removeAppCopy(id: string): Promise<boolean> {
  const comic = await getComicById(id);
  if (!comic) return false;
  await FileSystem.deleteAsync(comicRootFromPagesDir(comic.pagesDir), {
    idempotent: true,
  });
  await deleteComicRow(id);
  return true;
}

/** Remove from Comic Reader only - original CBZ on device is kept. */
export async function deleteComicFromApp(id: string): Promise<DeleteResult> {
  const removed = await removeAppCopy(id);
  return {
    appDeleted: removed,
    deviceDeleted: false,
    deviceDeleteError: removed ? undefined : 'Comic not found',
  };
}

/**
 * Remove from Comic Reader and delete the original file on device when possible.
 */
export async function deleteComicFromDevice(id: string): Promise<DeleteResult> {
  const comic = await getComicById(id);
  if (!comic) {
    return {
      appDeleted: false,
      deviceDeleted: false,
      deviceDeleteError: 'Comic not found',
    };
  }

  const sourceUri = comic.sourceUri;
  await FileSystem.deleteAsync(comicRootFromPagesDir(comic.pagesDir), {
    idempotent: true,
  });
  await deleteComicRow(id);

  let deviceDeleted = false;
  let deviceDeleteError: string | undefined;

  if (sourceUri) {
    try {
      const info = await FileSystem.getInfoAsync(sourceUri);
      if (info.exists) {
        await FileSystem.deleteAsync(sourceUri, { idempotent: true });
        deviceDeleted = true;
      } else {
        deviceDeleteError =
          'Removed from Comic Reader, but the original file was not found (it may have been moved).';
      }
    } catch {
      deviceDeleteError =
        'Removed from Comic Reader, but the original file on your device could not be deleted (permission or location). Delete it manually if needed.';
    }
  } else {
    deviceDeleteError =
      'Removed from Comic Reader. No original file path was stored, so nothing was deleted on device.';
  }

  return { appDeleted: true, deviceDeleted, deviceDeleteError };
}

/** @deprecated Prefer deleteComicFromApp / deleteComicFromDevice */
export async function deleteComicCompletely(id: string): Promise<DeleteResult> {
  return deleteComicFromDevice(id);
}

/**
 * Wipe extracted comics + DB rows from the app sandbox.
 * Does not delete original CBZ files in the user’s folder.
 */
export async function clearLibrarySandbox(): Promise<void> {
  const root = FileSystem.documentDirectory;
  if (root) {
    await FileSystem.deleteAsync(`${root}comics/`, { idempotent: true });
  }
  await deleteAllComicRows();
}
