export type SpreadHalf = 'full' | 'left' | 'right';
export type FitMode = 'width' | 'screen';
export type ReadingDirection = 'ltr';
export type ThemeMode = 'system' | 'light' | 'dark';

export type Comic = {
  id: string;
  title: string;
  series: string | null;
  sourceUri: string | null;
  /** Original archive filename (e.g. `Batman #01.cbz`) used for duplicate detection. */
  sourceFileName: string | null;
  coverPath: string;
  pagesDir: string;
  pageCount: number;
  currentPage: number;
  spreadHalf: SpreadHalf;
  isRead: boolean;
  isFavorite: boolean;
  fitMode: FitMode;
  readingDirection: ReadingDirection;
  lastReadAt: number | null;
  importedAt: number;
};

export type AppSettings = {
  themeMode: ThemeMode;
  autoSplitSpreads: boolean;
  defaultFit: FitMode;
  defaultDirection: ReadingDirection;
};

export type LibraryFilter = 'all' | 'unread' | 'in_progress' | 'finished' | 'favorites';
export type LibrarySort = 'recent' | 'title' | 'progress';
export type SortDirection = 'asc' | 'desc';

export type ImportProgress = {
  phase: 'copying' | 'extracting' | 'saving' | 'done' | 'cancelled' | 'error';
  current: number;
  total: number;
  message: string;
};

export type DeleteResult = {
  appDeleted: boolean;
  deviceDeleted: boolean;
  deviceDeleteError?: string;
};
