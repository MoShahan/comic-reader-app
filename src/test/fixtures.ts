import type { Comic } from '@/types/comic';

export function makeComic(overrides: Partial<Comic> = {}): Comic {
  return {
    id: 'c1',
    title: 'Sample Comic',
    series: null,
    sourceUri: 'file:///comics/sample.cbz',
    sourceFileName: 'sample.cbz',
    coverPath: 'file:///pages/page_0001.jpg',
    pagesDir: 'file:///pages/',
    pageCount: 20,
    currentPage: 0,
    spreadHalf: 'full',
    isRead: false,
    isFavorite: false,
    fitMode: 'screen',
    readingDirection: 'ltr',
    lastReadAt: null,
    importedAt: 1_000,
    ...overrides,
  };
}
