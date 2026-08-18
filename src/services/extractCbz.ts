import { File, FileMode } from 'expo-file-system';
import * as LegacyFS from 'expo-file-system/legacy';
import { Unzip, UnzipInflate } from 'fflate';

import { isImageEntry, naturalCompare } from '@/services/naturalSort';

const READ_CHUNK = 256 * 1024;

export type ExtractCallbacks = {
  onProgress?: (current: number, total: number) => void;
  isCancelled?: () => boolean;
};

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  if (chunks.length === 1) return chunks[0];
  let total = 0;
  for (const chunk of chunks) total += chunk.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function extensionForEntry(entryName: string): string {
  const ext = (entryName.split('.').pop() ?? 'jpg').toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(ext) ? ext : 'jpg';
}

function writeBinaryFile(path: string, data: Uint8Array): void {
  const outFile = new File(path);
  if (outFile.exists) {
    outFile.write(data);
  } else {
    outFile.create();
    outFile.write(data);
  }
}

type StagedPage = {
  entryName: string;
  tempPath: string;
};

/**
 * Unpack a CBZ/ZIP into `pagesDir` without Base64 and without holding the full
 * archive (or all pages) in JS memory - chunked disk reads + one-page inflate.
 */
export async function extractCbzToDirectory(
  sourceUri: string,
  pagesDir: string,
  callbacks: ExtractCallbacks = {},
): Promise<string[]> {
  if (callbacks.isCancelled?.()) {
    throw new Error('CANCELLED');
  }

  await LegacyFS.makeDirectoryAsync(pagesDir, { intermediates: true });

  const staged: StagedPage[] = [];
  let extractError: Error | null = null;

  const unzipper = new Unzip((file) => {
    if (extractError) return;

    if (!isImageEntry(file.name)) {
      // Drain non-image entries so compressed bytes are not buffered forever.
      file.ondata = () => undefined;
      try {
        file.start();
      } catch (error) {
        extractError = error instanceof Error ? error : new Error(String(error));
      }
      return;
    }

    const chunks: Uint8Array[] = [];
    file.ondata = (err, data, final) => {
      if (extractError) return;
      if (err) {
        extractError = err instanceof Error ? err : new Error(String(err));
        return;
      }
      if (data?.length) chunks.push(data);
      if (!final) return;

      try {
        const bytes = concatBytes(chunks);
        chunks.length = 0;
        const index = staged.length;
        const ext = extensionForEntry(file.name);
        const tempPath = `${pagesDir}_raw_${String(index).padStart(4, '0')}.${ext}`;
        writeBinaryFile(tempPath, bytes);
        staged.push({ entryName: file.name, tempPath });
        callbacks.onProgress?.(staged.length, 0);
      } catch (error) {
        extractError = error instanceof Error ? error : new Error(String(error));
      }
    };

    try {
      file.start();
    } catch (error) {
      extractError = error instanceof Error ? error : new Error(String(error));
    }
  });
  unzipper.register(UnzipInflate);

  const zipFile = new File(sourceUri);
  let handle: ReturnType<File['open']> | null = null;
  try {
    handle = zipFile.open(FileMode.ReadOnly);
    const size = handle.size ?? 0;
    if (size <= 0) {
      throw new Error('Could not read comic archive (empty or inaccessible).');
    }

    handle.offset = 0;
    let finalized = false;
    while ((handle.offset ?? 0) < size) {
      if (callbacks.isCancelled?.()) {
        throw new Error('CANCELLED');
      }
      if (extractError) throw extractError;

      const chunk = handle.readBytes(READ_CHUNK);
      if (!chunk.length) break;
      const atEnd = (handle.offset ?? 0) >= size;
      unzipper.push(chunk, atEnd);
      finalized = atEnd;
      await yieldToUi();
    }
    if (!finalized) {
      unzipper.push(new Uint8Array(0), true);
    }
    if (extractError) {
      throw extractError;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === 'CANCELLED') throw error;
    if (/OutOfMemory|oom|allocate|memory/i.test(message)) {
      throw new Error(
        'Not enough memory to open this CBZ in Expo Go. Try a smaller file or import one comic at a time.',
      );
    }
    throw error instanceof Error ? error : new Error(message);
  } finally {
    handle?.close();
  }

  if (staged.length === 0) {
    throw new Error('No images found in this CBZ file.');
  }

  staged.sort((a, b) => naturalCompare(a.entryName, b.entryName));

  const pagePaths: string[] = [];
  for (let i = 0; i < staged.length; i += 1) {
    if (callbacks.isCancelled?.()) {
      throw new Error('CANCELLED');
    }

    const { tempPath, entryName } = staged[i];
    const ext = extensionForEntry(entryName);
    const outPath = `${pagesDir}page_${String(i + 1).padStart(4, '0')}.${ext}`;

    if (tempPath !== outPath) {
      await LegacyFS.moveAsync({ from: tempPath, to: outPath });
    }
    pagePaths.push(outPath);
    callbacks.onProgress?.(i + 1, staged.length);

    if (i % 5 === 4) {
      await yieldToUi();
    }
  }

  return pagePaths;
}

export async function listPageFiles(pagesDir: string): Promise<string[]> {
  const names = await LegacyFS.readDirectoryAsync(pagesDir);
  return names
    .filter((n) => isImageEntry(n))
    .sort(naturalCompare)
    .map((n) => `${pagesDir}${n}`);
}
