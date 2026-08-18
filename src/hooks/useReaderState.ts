import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Image as RNImage, useWindowDimensions } from 'react-native';

import { getComicById, setComicRead, updateComicProgress } from '@/db/comicRepository';
import { isSpreadImage } from '@/library/selectors';
import { listPageFiles } from '@/services/extractCbz';
import { useLibraryStore } from '@/store/libraryStore';
import { useTheme } from '@/theme';

import type { Comic, SpreadHalf } from '@/types/comic';

export type ReaderStep = {
  pageIndex: number;
  half: SpreadHalf;
  uri: string;
  isSpread: boolean;
};

function probeSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    RNImage.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => resolve({ width: 1, height: 1 }),
    );
  });
}

export function useReaderState(
  comicId: string,
  options: { startFromBeginning?: boolean } = {},
) {
  const startFromBeginning = options.startFromBeginning === true;
  const { settings } = useTheme();
  const patchComic = useLibraryStore((s) => s.patchComic);
  const refreshLibrary = useLibraryStore((s) => s.refresh);
  const { width: screenW, height: screenH } = useWindowDimensions();
  const isPortrait = screenH >= screenW;

  const [comic, setComic] = useState<Comic | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [spreadFlags, setSpreadFlags] = useState<boolean[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [positionReady, setPositionReady] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [dimmer, setDimmer] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestProgress = useRef<{ pageIndex: number; half: SpreadHalf } | null>(null);

  const load = useCallback(async () => {
    const row = await getComicById(comicId);
    if (!row) {
      setComic(null);
      return;
    }
    setComic(row);
    const files = await listPageFiles(row.pagesDir);
    setPages(files);

    if (!settings.autoSplitSpreads || files.length === 0) {
      setSpreadFlags(files.map(() => false));
      return;
    }

    // Parallel size probes (much faster than sequential await-in-loop)
    const sizes = await Promise.all(files.map((uri) => probeSize(uri)));
    setSpreadFlags(sizes.map((s) => isSpreadImage(s.width, s.height)));
  }, [comicId, settings.autoSplitSpreads]);

  useEffect(() => {
    void load();
  }, [load]);

  const steps: ReaderStep[] = useMemo(() => {
    if (!comic) return [];
    const result: ReaderStep[] = [];
    pages.forEach((uri, pageIndex) => {
      const isSpread = spreadFlags[pageIndex] === true;
      if (isSpread && isPortrait && settings.autoSplitSpreads) {
        // Always LTR spread order: left half, then right half
        result.push({ pageIndex, half: 'left', uri, isSpread: true });
        result.push({ pageIndex, half: 'right', uri, isSpread: true });
      } else {
        result.push({ pageIndex, half: 'full', uri, isSpread });
      }
    });
    return result;
  }, [comic, pages, spreadFlags, isPortrait, settings.autoSplitSpreads]);

  useEffect(() => {
    setPositionReady(false);
  }, [comicId, startFromBeginning]);

  useEffect(() => {
    if (!comic || steps.length === 0) return;

    if (startFromBeginning) {
      setStepIndex(0);
      latestProgress.current = { pageIndex: 0, half: 'full' };
      setComic((prev) =>
        prev ? { ...prev, currentPage: 0, spreadHalf: 'full' } : prev,
      );
      void updateComicProgress(comicId, 0, 'full');
      patchComic(comicId, {
        currentPage: 0,
        spreadHalf: 'full',
        lastReadAt: Date.now(),
      });
      setPositionReady(true);
      return;
    }

    const idx = steps.findIndex(
      (s) =>
        s.pageIndex === comic.currentPage &&
        (comic.spreadHalf === 'full' || s.half === comic.spreadHalf),
    );
    setStepIndex(idx >= 0 ? idx : Math.min(comic.currentPage, steps.length - 1));
    setPositionReady(true);
  }, [comic?.id, steps.length, startFromBeginning, comicId, patchComic]); // eslint-disable-line react-hooks/exhaustive-deps

  const flushProgress = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const pending = latestProgress.current;
    if (!pending) return;
    await updateComicProgress(comicId, pending.pageIndex, pending.half);
    patchComic(comicId, {
      currentPage: pending.pageIndex,
      spreadHalf: pending.half,
      lastReadAt: Date.now(),
    });
  }, [comicId, patchComic]);

  useEffect(() => {
    return () => {
      void flushProgress().then(() => refreshLibrary());
    };
  }, [flushProgress, refreshLibrary]);

  const persistProgress = useCallback(
    (pageIndex: number, half: SpreadHalf) => {
      latestProgress.current = { pageIndex, half };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void updateComicProgress(comicId, pageIndex, half);
        patchComic(comicId, {
          currentPage: pageIndex,
          spreadHalf: half,
          lastReadAt: Date.now(),
        });
      }, 300);
    },
    [comicId, patchComic],
  );

  const goToStep = useCallback(
    (next: number) => {
      if (steps.length === 0) return;
      const clamped = Math.max(0, Math.min(steps.length - 1, next));
      setStepIndex(clamped);
      const step = steps[clamped];
      persistProgress(step.pageIndex, step.half);
      setComic((prev) =>
        prev
          ? {
              ...prev,
              currentPage: step.pageIndex,
              spreadHalf: step.half,
              lastReadAt: Date.now(),
            }
          : prev,
      );
    },
    [steps, persistProgress],
  );

  const toggleChrome = useCallback(() => setChromeVisible((v) => !v), []);

  const markRead = useCallback(
    async (isRead: boolean) => {
      await setComicRead(comicId, isRead);
      setComic((prev) => (prev ? { ...prev, isRead } : prev));
      patchComic(comicId, { isRead });
    },
    [comicId, patchComic],
  );

  return {
    comic,
    steps,
    stepIndex,
    positionReady,
    goToStep,
    chromeVisible,
    toggleChrome,
    dimmer,
    setDimmer,
    zoomed,
    setZoomed,
    markRead,
    flushProgress,
  };
}
