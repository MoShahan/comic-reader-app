import { memo } from 'react';

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme, spacing, typography, radii } from '@/theme';

import type { AppColors } from '@/theme/colors';
import type { LibraryFilter, LibrarySort, SortDirection } from '@/types/comic';

const FILTERS: { key: LibraryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'in_progress', label: 'Reading' },
  { key: 'finished', label: 'Finished' },
  { key: 'favorites', label: 'Favorites' },
];

const SORTS: {
  key: LibrarySort;
  label: string;
  ascHint: string;
  descHint: string;
}[] = [
  { key: 'recent', label: 'Recent', ascHint: 'Oldest', descHint: 'Newest' },
  { key: 'title', label: 'Title', ascHint: 'A–Z', descHint: 'Z–A' },
  { key: 'progress', label: 'Progress', ascHint: 'Least', descHint: 'Most' },
];

type Props = {
  filter: LibraryFilter;
  sort: LibrarySort;
  sortDirection: SortDirection;
  onFilterChange: (filter: LibraryFilter) => void;
  onSortChange: (sort: LibrarySort) => void;
};

function Chip({
  label,
  active,
  onPress,
  colors,
  grow,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: AppColors;
  grow?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        grow && styles.chipGrow,
        {
          backgroundColor: active ? colors.accent : colors.surface,
          borderColor: active ? colors.accent : colors.border,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? '#FFFFFF' : colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

function LibraryControlsComponent({
  filter,
  sort,
  sortDirection,
  onFilterChange,
  onSortChange,
}: Props) {
  const { colors } = useTheme();
  const activeSort = SORTS.find((s) => s.key === sort) ?? SORTS[0];
  const orderLabel = sortDirection === 'asc' ? activeSort.ascHint : activeSort.descHint;

  return (
    <View style={styles.wrap}>
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>Filter</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={filter === f.key}
              onPress={() => onFilterChange(f.key)}
              colors={colors}
            />
          ))}
        </ScrollView>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.sortHeader}>
          <Text style={[styles.sectionLabelInline, { color: colors.muted }]}>Sort by</Text>
          <Text style={[styles.orderText, { color: colors.accent }]}>{orderLabel}</Text>
        </View>

        <View style={styles.row}>
          {SORTS.map((s) => (
            <Chip
              key={s.key}
              label={s.label}
              active={sort === s.key}
              onPress={() => onSortChange(s.key)}
              colors={colors}
              grow
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export const LibraryControls = memo(LibraryControlsComponent);

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  panel: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  sectionLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  sectionLabelInline: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  sortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  orderText: {
    ...typography.caption,
    fontFamily: 'DMSans_700Bold',
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipGrow: {
    flex: 1,
  },
  chipText: {
    ...typography.caption,
    fontFamily: 'DMSans_700Bold',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.xs,
  },
});
