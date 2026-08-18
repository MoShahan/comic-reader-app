import {
  applyFilter,
  applySort,
  isSpreadImage,
  selectContinueComic,
  selectSeriesGroups,
  selectVisibleComics,
  shouldAutoMarkRead,
} from '@/library/selectors';
import { makeComic } from '@/test/fixtures';

describe('applyFilter', () => {
  const comics = [
    makeComic({ id: '1', title: 'A', currentPage: 0, isRead: false }),
    makeComic({ id: '2', title: 'B', currentPage: 5, isRead: false }),
    makeComic({ id: '3', title: 'C', currentPage: 10, isRead: true }),
    makeComic({
      id: '4',
      title: 'D',
      currentPage: 0,
      isRead: false,
      isFavorite: true,
    }),
  ];

  it('returns all comics for all filter', () => {
    expect(applyFilter(comics, 'all')).toHaveLength(4);
  });

  it('filters unread (not read and page 0)', () => {
    expect(
      applyFilter(comics, 'unread')
        .map((c) => c.id)
        .sort(),
    ).toEqual(['1', '4']);
  });

  it('filters in progress', () => {
    expect(applyFilter(comics, 'in_progress').map((c) => c.id)).toEqual(['2']);
  });

  it('filters finished only when manually marked read', () => {
    expect(applyFilter(comics, 'finished').map((c) => c.id)).toEqual(['3']);
  });

  it('filters favorites', () => {
    expect(applyFilter(comics, 'favorites').map((c) => c.id)).toEqual(['4']);
  });
});

describe('applySort', () => {
  const comics = [
    makeComic({
      id: '1',
      title: 'Zebra',
      currentPage: 1,
      pageCount: 10,
      importedAt: 100,
      lastReadAt: 50,
    }),
    makeComic({
      id: '2',
      title: 'Alpha',
      currentPage: 9,
      pageCount: 10,
      importedAt: 200,
      lastReadAt: 300,
    }),
    makeComic({
      id: '3',
      title: 'Middle',
      currentPage: 0,
      pageCount: 10,
      importedAt: 400,
      lastReadAt: null,
    }),
  ];

  it('sorts by title ascending by default', () => {
    expect(applySort(comics, 'title').map((c) => c.title)).toEqual(['Alpha', 'Middle', 'Zebra']);
  });

  it('sorts by title descending when requested', () => {
    expect(applySort(comics, 'title', 'desc').map((c) => c.title)).toEqual([
      'Zebra',
      'Middle',
      'Alpha',
    ]);
  });

  it('sorts by progress descending by default', () => {
    expect(applySort(comics, 'progress').map((c) => c.id)).toEqual(['2', '1', '3']);
  });

  it('sorts by progress ascending when requested', () => {
    expect(applySort(comics, 'progress', 'asc').map((c) => c.id)).toEqual(['3', '1', '2']);
  });

  it('sorts by recent activity descending by default', () => {
    expect(applySort(comics, 'recent').map((c) => c.id)).toEqual(['3', '2', '1']);
  });

  it('sorts by recent ascending when requested', () => {
    expect(applySort(comics, 'recent', 'asc').map((c) => c.id)).toEqual(['1', '2', '3']);
  });
});

describe('selectVisibleComics', () => {
  it('combines filter and sort', () => {
    const comics = [
      makeComic({ id: '1', title: 'B', isRead: true }),
      makeComic({ id: '2', title: 'A', isRead: true }),
      makeComic({ id: '3', title: 'C', isRead: false }),
    ];
    expect(selectVisibleComics(comics, 'finished', 'title', 'asc').map((c) => c.id)).toEqual([
      '2',
      '1',
    ]);
  });
});

describe('selectContinueComic', () => {
  it('picks most recently read unfinished comic', () => {
    const comics = [
      makeComic({ id: '1', lastReadAt: 10, isRead: false }),
      makeComic({ id: '2', lastReadAt: 50, isRead: false }),
      makeComic({ id: '3', lastReadAt: 100, isRead: true }),
      makeComic({ id: '4', lastReadAt: null, isRead: false }),
    ];
    expect(selectContinueComic(comics)?.id).toBe('2');
  });

  it('returns null when nothing to continue', () => {
    expect(selectContinueComic([makeComic({ lastReadAt: null })])).toBeNull();
    expect(selectContinueComic([makeComic({ lastReadAt: 1, isRead: true })])).toBeNull();
  });
});

describe('selectSeriesGroups', () => {
  it('groups by series and sorts labels', () => {
    const comics = [
      makeComic({ id: '1', series: 'Batman' }),
      makeComic({ id: '2', series: null }),
      makeComic({ id: '3', series: 'Batman' }),
      makeComic({ id: '4', series: 'Avengers' }),
    ];
    const groups = selectSeriesGroups(comics);
    expect(groups.map((g) => g.series)).toEqual(['Avengers', 'Batman', 'Ungrouped']);
    expect(groups.find((g) => g.series === 'Batman')?.comics).toHaveLength(2);
  });
});

describe('isSpreadImage', () => {
  it('detects wide double-page images', () => {
    expect(isSpreadImage(2000, 1000)).toBe(true);
    expect(isSpreadImage(1000, 1500)).toBe(false);
    expect(isSpreadImage(1400, 1000)).toBe(false);
    expect(isSpreadImage(1401, 1000)).toBe(true);
  });

  it('guards against zero height', () => {
    expect(isSpreadImage(1000, 0)).toBe(false);
  });
});

describe('shouldAutoMarkRead', () => {
  it('never auto-marks as read', () => {
    expect(shouldAutoMarkRead(0, 10)).toBe(false);
    expect(shouldAutoMarkRead(9, 10)).toBe(false);
    expect(shouldAutoMarkRead(19, 20)).toBe(false);
  });
});
