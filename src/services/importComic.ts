import { Platform } from 'react-native';

import * as FileSystem from 'expo-file-system/legacy';

import { findComicBySourceFileName, insertComic } from '@/db/comicRepository';
import { extractCbzToDirectory } from '@/services/extractCbz';
import { guessSeries, titleFromFilename } from '@/services/naturalSort';

import type { Comic, ImportProgress } from '@/types/comic';

type ImportSource = {
  uri: string;
  name: string;
};

function comicsRoot(): string {
  const root = FileSystem.documentDirectory;
  if (!root) throw new Error('Document directory is unavailable.');
  return `${root}comics/`;
}

function makeId(): string {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function fileNameFromUri(uri: string): string {
  const decoded = decodeURIComponent(uri);
  const parts = decoded.split(/[/\\]/).filter(Boolean);
  return parts[parts.length - 1] || 'comic.cbz';
}

function normalizeArchiveName(name: string): string {
  return name.trim().toLowerCase();
}

function isComicArchiveName(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.cbz') || lower.endsWith('.zip');
}

export type ImportOptions = {
  onProgress?: (progress: ImportProgress) => void;
  onComicImported?: (comic: Comic) => void;
  isCancelled?: () => boolean;
};

class DuplicateComicError extends Error {
  constructor(fileName: string) {
    super(`Already in library: ${fileName}`);
    this.name = 'DuplicateComicError';
  }
}

async function importSingleSource(source: ImportSource, options: ImportOptions): Promise<Comic> {
  const name = source.name || 'comic.cbz';
  const lower = name.toLowerCase();
  if (lower.endsWith('.cbr')) {
    throw new Error(
      'CBR is not supported in Expo Go. Convert to CBZ on your computer (7-Zip/WinRAR: extract then zip), then add the CBZ to your comics folder.',
    );
  }
  if (!isComicArchiveName(name)) {
    throw new Error('Only CBZ or ZIP comic files are supported.');
  }

  const existing = await findComicBySourceFileName(name);
  if (existing) {
    throw new DuplicateComicError(name);
  }

  const id = makeId();
  const comicDir = `${comicsRoot()}${id}/`;
  const pagesDir = `${comicDir}pages/`;
  const archivePath = `${comicDir}source.cbz`;

  const report = (progress: ImportProgress) => options.onProgress?.(progress);

  try {
    await FileSystem.makeDirectoryAsync(comicDir, { intermediates: true });

    report({
      phase: 'copying',
      current: 0,
      total: 1,
      message: `Copying ${name}…`,
    });
    await FileSystem.copyAsync({ from: source.uri, to: archivePath });
    if (options.isCancelled?.()) throw new Error('CANCELLED');

    report({
      phase: 'extracting',
      current: 0,
      total: 1,
      message: `Extracting ${name}…`,
    });
    const pages = await extractCbzToDirectory(archivePath, pagesDir, {
      onProgress: (current, total) =>
        report({
          phase: 'extracting',
          current,
          total: total || current,
          message:
            total > 0 ? `Extracting page ${current} of ${total}…` : `Extracting page ${current}…`,
        }),
      isCancelled: options.isCancelled,
    });

    report({
      phase: 'saving',
      current: 1,
      total: 1,
      message: 'Saving to library…',
    });
    const title = titleFromFilename(name);
    const comic: Comic = {
      id,
      title,
      series: guessSeries(title),
      sourceUri: source.uri,
      sourceFileName: name,
      coverPath: pages[0],
      pagesDir,
      pageCount: pages.length,
      currentPage: 0,
      spreadHalf: 'full',
      isRead: false,
      isFavorite: false,
      fitMode: 'screen',
      readingDirection: 'ltr',
      lastReadAt: null,
      importedAt: Date.now(),
    };
    await insertComic(comic);

    report({ phase: 'done', current: 1, total: 1, message: 'Added' });
    return comic;
  } catch (error) {
    await FileSystem.deleteAsync(comicDir, { idempotent: true }).catch(() => undefined);
    throw error;
  }
}

async function importSources(sources: ImportSource[], options: ImportOptions): Promise<Comic[]> {
  const imported: Comic[] = [];
  const seenInBatch = new Set<string>();
  let skipped = 0;

  for (let i = 0; i < sources.length; i += 1) {
    if (options.isCancelled?.()) break;
    const source = sources[i];
    const key = normalizeArchiveName(source.name);

    options.onProgress?.({
      phase: 'copying',
      current: i,
      total: sources.length,
      message: `Adding ${i + 1} of ${sources.length}: ${source.name}`,
    });

    if (seenInBatch.has(key)) {
      skipped += 1;
      options.onProgress?.({
        phase: 'copying',
        current: i + 1,
        total: sources.length,
        message: `Skipping duplicate ${source.name}`,
      });
      continue;
    }
    seenInBatch.add(key);

    try {
      const comic = await importSingleSource(source, options);
      imported.push(comic);
      options.onComicImported?.(comic);
    } catch (error) {
      if (error instanceof Error && error.message === 'CANCELLED') throw error;
      if (error instanceof DuplicateComicError) {
        skipped += 1;
        options.onProgress?.({
          phase: 'copying',
          current: i + 1,
          total: sources.length,
          message: `Skipping duplicate ${source.name}`,
        });
        continue;
      }
      if (__DEV__) {
        console.warn('Import failed for', source.name, error);
      }
    }
  }

  if (imported.length === 0 && skipped > 0) {
    options.onProgress?.({
      phase: 'done',
      current: sources.length,
      total: sources.length,
      message: `All ${skipped} comic${skipped === 1 ? '' : 's'} already in library`,
    });
  } else if (skipped > 0) {
    options.onProgress?.({
      phase: 'done',
      current: sources.length,
      total: sources.length,
      message: `Added ${imported.length}, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}`,
    });
  }

  return imported;
}

/**
 * Android: pick a folder via Storage Access Framework and add every
 * .cbz / .zip found in that folder (top level only) to the library.
 */
export async function pickFolderAndImportComics(options: ImportOptions = {}): Promise<Comic[]> {
  if (Platform.OS !== 'android') {
    throw new Error(
      'Selecting a comics folder is available on Android. On iOS this needs a different picker in a later build.',
    );
  }

  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!permissions.granted || !permissions.directoryUri) {
    return [];
  }

  options.onProgress?.({
    phase: 'copying',
    current: 0,
    total: 1,
    message: 'Scanning folder…',
  });

  const uris = await FileSystem.StorageAccessFramework.readDirectoryAsync(permissions.directoryUri);

  const sources: ImportSource[] = uris
    .map((uri) => ({ uri, name: fileNameFromUri(uri) }))
    .filter((s) => isComicArchiveName(s.name));

  if (sources.length === 0) {
    throw new Error('No CBZ or ZIP files found in that folder.');
  }

  return importSources(sources, options);
}
