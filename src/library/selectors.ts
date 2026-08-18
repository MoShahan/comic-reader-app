import type { Comic, LibraryFilter, LibrarySort, SortDirection } from '@/types/comic';

/** Default direction when switching to a sort key. */
export function defaultSortDirection(sort: LibrarySort): SortDirection {
  switch (sort) {
    case 'title':
      return 'asc';
    case 'progress':
    case 'recent':
    default:
      return 'desc';
  }
}

export function applySort(
  comics: Comic[],
  sort: LibrarySort,
  direction: SortDirection = defaultSortDirection(sort),
): Comic[] {
  const list = [...comics];
  const dir = direction === 'asc' ? 1 : -1;

  switch (sort) {
    case 'title':
      return list.sort((a, b) => dir * a.title.localeCompare(b.title));
    case 'progress':
      return list.sort((a, b) => {
        const ap = a.pageCount ? a.currentPage / a.pageCount : 0;
        const bp = b.pageCount ? b.currentPage / b.pageCount : 0;
        return dir * (ap - bp);
      });
    case 'recent':
    default:
      return list.sort((a, b) => {
        const at = a.lastReadAt ?? a.importedAt;
        const bt = b.lastReadAt ?? b.importedAt;
        return dir * (at - bt);
      });
  }
}

export function applyFilter(comics: Comic[], filter: LibraryFilter): Comic[] {
  switch (filter) {
    case 'unread':
      return comics.filter((c) => !c.isRead && c.currentPage === 0);
    case 'in_progress':
      return comics.filter((c) => !c.isRead && c.currentPage > 0);
    case 'finished':
      return comics.filter((c) => c.isRead);
    case 'favorites':
      return comics.filter((c) => c.isFavorite);
    case 'all':
    default:
      return comics;
  }
}

export function selectVisibleComics(
  comics: Comic[],
  filter: LibraryFilter,
  sort: LibrarySort,
  direction: SortDirection = defaultSortDirection(sort),
): Comic[] {
  return applySort(applyFilter(comics, filter), sort, direction);
}

export function selectContinueComic(comics: Comic[]): Comic | null {
  const withHistory = comics
    .filter((c) => c.lastReadAt != null && !c.isRead)
    .sort((a, b) => (b.lastReadAt ?? 0) - (a.lastReadAt ?? 0));
  return withHistory[0] ?? null;
}

export function selectSeriesGroups(comics: Comic[]): { series: string; comics: Comic[] }[] {
  const map = new Map<string, Comic[]>();
  for (const comic of comics) {
    const key = comic.series?.trim() || 'Ungrouped';
    const list = map.get(key) ?? [];
    list.push(comic);
    map.set(key, list);
  }
  return [...map.entries()]
    .map(([series, items]) => ({ series, comics: items }))
    .sort((a, b) => a.series.localeCompare(b.series));
}

/** Wide images above this ratio are treated as double-page spreads */
export const SPREAD_ASPECT_RATIO = 1.4;

export function isSpreadImage(width: number, height: number): boolean {
  if (height <= 0) return false;
  return width / height > SPREAD_ASPECT_RATIO;
}

/**
 * Mark-as-read is never inferred from progress.
 * Finishing the last page must not flip isRead.
 */
export function shouldAutoMarkRead(_currentPage: number, _pageCount: number): boolean {
  return false;
}
