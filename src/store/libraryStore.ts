import { create } from 'zustand';

import { getAllComics } from '@/db/comicRepository';
import { defaultSortDirection } from '@/library/selectors';

import type { Comic, LibraryFilter, LibrarySort, SortDirection } from '@/types/comic';

type LibraryState = {
  comics: Comic[];
  loading: boolean;
  filter: LibraryFilter;
  sort: LibrarySort;
  sortDirection: SortDirection;
  setFilter: (filter: LibraryFilter) => void;
  setSort: (sort: LibrarySort) => void;
  toggleSortDirection: () => void;
  refresh: () => Promise<void>;
  upsertLocal: (comic: Comic) => void;
  removeLocal: (id: string) => void;
  patchComic: (id: string, patch: Partial<Comic>) => void;
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
  comics: [],
  loading: true,
  filter: 'all',
  sort: 'recent',
  sortDirection: defaultSortDirection('recent'),
  setFilter: (filter) => set({ filter }),
  setSort: (sort) => {
    const current = get().sort;
    if (current === sort) {
      set({
        sortDirection: get().sortDirection === 'asc' ? 'desc' : 'asc',
      });
      return;
    }
    set({ sort, sortDirection: defaultSortDirection(sort) });
  },
  toggleSortDirection: () => set({ sortDirection: get().sortDirection === 'asc' ? 'desc' : 'asc' }),
  refresh: async () => {
    set({ loading: true });
    const comics = await getAllComics();
    set({ comics, loading: false });
  },
  upsertLocal: (comic) => {
    const comics = get().comics.filter((c) => c.id !== comic.id);
    set({ comics: [comic, ...comics] });
  },
  removeLocal: (id) => {
    set({ comics: get().comics.filter((c) => c.id !== id) });
  },
  patchComic: (id, patch) => {
    set({
      comics: get().comics.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  },
}));
