import { memo } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography } from '@/theme';

import type { Comic } from '@/types/comic';

type Props = {
  visible: boolean;
  comic: Comic;
  pageLabel: string;
  stepIndex: number;
  stepCount: number;
  dimmer: number;
  onBack: () => void;
  onToggleRead: () => void;
  onScrub: (index: number) => void;
  onDimmer: (value: number) => void;
};

function ReaderOverlayComponent({
  visible,
  comic,
  pageLabel,
  stepIndex,
  stepCount,
  dimmer,
  onBack,
  onToggleRead,
  onScrub,
  onDimmer,
}: Props) {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View style={[styles.top, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.chip}>
          <Text style={styles.chipText}>Back</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {comic.title}
        </Text>
        <Pressable onPress={onToggleRead} hitSlop={12} style={styles.chip}>
          <Text style={styles.chipText}>{comic.isRead ? 'Unread' : 'Mark read'}</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.bottom,
          { paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.sm },
        ]}
      >
        <Text style={styles.page}>{pageLabel}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={Math.max(0, stepCount - 1)}
          step={1}
          value={stepIndex}
          onSlidingComplete={(v) => onScrub(Math.round(v))}
          minimumTrackTintColor="#E8A54B"
          maximumTrackTintColor="#444"
          thumbTintColor="#F2F4F8"
        />
        <Text style={styles.dimLabel}>Dimmer</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={0.7}
          value={dimmer}
          onValueChange={onDimmer}
          minimumTrackTintColor="#888"
          maximumTrackTintColor="#333"
          thumbTintColor="#ccc"
        />
      </View>
    </View>
  );
}

export const ReaderOverlay = memo(ReaderOverlayComponent);

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.78)',
    gap: spacing.sm,
  },
  bottom: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  title: {
    flex: 1,
    color: '#F2F4F8',
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chipText: { color: '#F2F4F8', ...typography.caption },
  page: {
    color: '#F2F4F8',
    textAlign: 'center',
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  slider: { width: '100%', height: 36 },
  dimLabel: { color: '#9AA3B2', ...typography.caption, marginTop: spacing.sm },
});
