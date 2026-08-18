import { useCallback, useEffect, useRef } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import PagerView from 'react-native-pager-view';

import { ReaderOverlay } from '@/components/ReaderOverlay';
import { ReaderPage } from '@/components/ReaderPage';
import { useReaderState } from '@/hooks/useReaderState';

import type { RootStackParamList } from '@/navigation/types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;

/** Keep current ± this many steps mounted so swipes/taps have a ready page. */
const PAGE_WINDOW = 2;

export function ReaderScreen({ route, navigation }: Props) {
  const { comicId, startFromBeginning } = route.params;
  const { width, height } = useWindowDimensions();
  const pagerRef = useRef<PagerView>(null);
  /** True when stepIndex was updated from a user swipe (skip programmatic re-sync). */
  const skipProgrammaticScroll = useRef(false);
  const isFirstStepSync = useRef(true);
  const lastStepIndex = useRef(0);

  const reader = useReaderState(comicId, { startFromBeginning });
  const {
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
  } = reader;

  useEffect(() => {
    void activateKeepAwakeAsync('reader');
    return () => {
      void deactivateKeepAwake('reader');
    };
  }, []);

  const goNext = useCallback(() => {
    goToStep(stepIndex + 1);
  }, [goToStep, stepIndex]);

  const goPrev = useCallback(() => {
    goToStep(stepIndex - 1);
  }, [goToStep, stepIndex]);

  // LTR taps: left = previous, right = next
  const onTapLeft = useCallback(() => {
    if (zoomed) return;
    goPrev();
  }, [zoomed, goPrev]);

  const onTapRight = useCallback(() => {
    if (zoomed) return;
    goNext();
  }, [zoomed, goNext]);

  // Animate programmatic page changes (tap zones / scrubber / vertical swipe).
  useEffect(() => {
    if (!positionReady) return;

    if (isFirstStepSync.current) {
      isFirstStepSync.current = false;
      lastStepIndex.current = stepIndex;
      return;
    }

    if (skipProgrammaticScroll.current) {
      skipProgrammaticScroll.current = false;
      lastStepIndex.current = stepIndex;
      return;
    }

    const delta = Math.abs(stepIndex - lastStepIndex.current);
    lastStepIndex.current = stepIndex;

    if (delta <= 1) {
      pagerRef.current?.setPage(stepIndex);
    } else {
      pagerRef.current?.setPageWithoutAnimation(stepIndex);
    }
  }, [stepIndex, positionReady]);

  if (!comic || steps.length === 0 || !positionReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#E8A54B" />
        <Text style={styles.loadingText}>Loading pages…</Text>
      </View>
    );
  }

  const pageLabel = `Page ${steps[stepIndex].pageIndex + 1} / ${comic.pageCount}`;

  return (
    <View style={styles.root}>
      <StatusBar hidden={!chromeVisible} style="light" />

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={stepIndex}
        scrollEnabled={!zoomed}
        offscreenPageLimit={PAGE_WINDOW}
        overdrag
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          if (index !== stepIndex) {
            skipProgrammaticScroll.current = true;
            goToStep(index);
          }
        }}
      >
        {steps.map((step, index) => (
          <View key={`${step.pageIndex}-${step.half}-${index}`} style={{ width, height }}>
            {Math.abs(index - stepIndex) <= PAGE_WINDOW ? (
              <ReaderPage
                uri={step.uri}
                half={step.half}
                onZoomChange={setZoomed}
                onTapCenter={toggleChrome}
                onTapLeft={onTapLeft}
                onTapRight={onTapRight}
                onSwipeUp={goNext}
                onSwipeDown={goPrev}
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: '#000' }} />
            )}
          </View>
        ))}
      </PagerView>

      <View
        pointerEvents="none"
        style={[styles.dimmer, { opacity: dimmer, backgroundColor: '#000' }]}
      />

      <ReaderOverlay
        visible={chromeVisible}
        comic={comic}
        pageLabel={pageLabel}
        stepIndex={stepIndex}
        stepCount={steps.length}
        dimmer={dimmer}
        onBack={() => navigation.goBack()}
        onToggleRead={() => void markRead(!comic.isRead)}
        onScrub={(index) => goToStep(index)}
        onDimmer={setDimmer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  pager: { flex: 1 },
  dimmer: { ...StyleSheet.absoluteFill },
  loading: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { color: '#9AA3B2' },
});
