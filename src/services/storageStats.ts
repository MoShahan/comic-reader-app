import * as FileSystem from 'expo-file-system/legacy';

import { formatBytes } from '@/services/format';

async function dirSize(uri: string): Promise<number> {
  const info = await FileSystem.getInfoAsync(uri);
  if (!info.exists) return 0;
  if (!info.isDirectory) {
    return 'size' in info && typeof info.size === 'number' ? info.size : 0;
  }
  const children = await FileSystem.readDirectoryAsync(uri);
  let total = 0;
  for (const name of children) {
    const child = uri.endsWith('/') ? `${uri}${name}` : `${uri}/${name}`;
    total += await dirSize(child);
  }
  return total;
}

export async function getLibraryStorageStats(): Promise<{
  bytes: number;
  label: string;
  comicFolders: number;
}> {
  const root = FileSystem.documentDirectory;
  if (!root) {
    return { bytes: 0, label: '0 B', comicFolders: 0 };
  }
  const comicsDir = `${root}comics/`;
  const info = await FileSystem.getInfoAsync(comicsDir);
  if (!info.exists) {
    return { bytes: 0, label: '0 B', comicFolders: 0 };
  }
  const folders = await FileSystem.readDirectoryAsync(comicsDir);
  const bytes = await dirSize(comicsDir);
  return { bytes, label: formatBytes(bytes), comicFolders: folders.length };
}
