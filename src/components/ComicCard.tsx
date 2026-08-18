import { memo } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Image } from 'expo-image';

import { useTheme, spacing, radii, typography } from '@/theme';

import type { Comic } from '@/types/comic';

type Props = {
  comic: Comic;
  onPress: () => void;
  onLongPress?: () => void;
  width: number;
};

function ComicCardComponent({ comic, onPress, onLongPress, width }: Props) {
  const { colors } = useTheme();
  const progress = comic.pageCount > 0 ? comic.currentPage / Math.max(comic.pageCount - 1, 1) : 0;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        { width, backgroundColor: colors.surface, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={[styles.coverWrap, { backgroundColor: colors.surfaceMuted }]}>
        <Image
          source={{ uri: comic.coverPath }}
          style={styles.cover}
          contentFit="cover"
          transition={200}
        />
        {comic.isRead ? (
          <View style={[styles.badge, { backgroundColor: colors.success }]}>
            <Text style={styles.badgeText}>Read</Text>
          </View>
        ) : null}
        {comic.isFavorite ? (
          <View style={[styles.fav, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>★</Text>
          </View>
        ) : null}
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {comic.title}
      </Text>
      <View style={[styles.track, { backgroundColor: colors.progressTrack }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
              backgroundColor: colors.progressFill,
            },
          ]}
        />
      </View>
      <Text style={[styles.meta, { color: colors.muted }]}>
        {comic.currentPage + 1}/{comic.pageCount}
      </Text>
    </Pressable>
  );
}

export const ComicCard = memo(ComicCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  coverWrap: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  cover: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  fav: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 11, fontFamily: 'DMSans_700Bold' },
  title: { ...typography.caption, marginTop: spacing.sm, minHeight: 32 },
  track: {
    height: 3,
    borderRadius: 2,
    marginTop: spacing.xs,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 2 },
  meta: { ...typography.caption, marginTop: 4, opacity: 0.8 },
});
