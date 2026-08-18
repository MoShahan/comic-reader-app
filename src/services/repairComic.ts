import * as FileSystem from 'expo-file-system/legacy';

import { getComicById } from '@/db/comicRepository';
import { getDb } from '@/db/database';
import { extractCbzToDirectory, listPageFiles } from '@/services/extractCbz';
import { comicRootFromPagesDir } from '@/services/paths';

/**
 * Re-extract pages from a stored archive copy if present, or rebuild page list from disk.
 */
export async function repairComic(id: string): Promise<{ pageCount: number }> {
  const comic = await getComicById(id);
  if (!comic) throw new Error('Comic not found');

  const archivePath = `${comicRootFromPagesDir(comic.pagesDir)}source.cbz`;
  const archiveInfo = await FileSystem.getInfoAsync(archivePath);
  const db = await getDb();

  if (archiveInfo.exists) {
    await FileSystem.deleteAsync(comic.pagesDir, { idempotent: true });
    const pages = await extractCbzToDirectory(archivePath, comic.pagesDir);
    await db.runAsync(
      'UPDATE comics SET pageCount = ?, coverPath = ?, currentPage = MIN(currentPage, ?) WHERE id = ?',
      [pages.length, pages[0], Math.max(0, pages.length - 1), id],
    );
    return { pageCount: pages.length };
  }

  const pages = await listPageFiles(comic.pagesDir);
  if (pages.length === 0) {
    throw new Error('No pages found. Re-import this comic.');
  }
  await db.runAsync(
    'UPDATE comics SET pageCount = ?, coverPath = ?, currentPage = MIN(currentPage, ?) WHERE id = ?',
    [pages.length, pages[0], Math.max(0, pages.length - 1), id],
  );
  return { pageCount: pages.length };
}
