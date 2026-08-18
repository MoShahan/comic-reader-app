import { useCallback, useMemo } from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ComicCard } from '@/components/ComicCard';
import { ContinueCard } from '@/components/ContinueCard';
import { ImportProgressModal } from '@/components/ImportProgressModal';
import { LibraryControls } from '@/components/LibraryControls';
import { useComicImport, useLibrary } from '@/hooks/useLibrary';
import {
  selectContinueComic as pickContinueComic,
  selectVisibleComics as pickVisibleComics,
} from '@/library/selectors';
import { confirmDeleteComic } from '@/services/confirmDelete';
import { useLibraryStore } from '@/store/libraryStore';
import { useTheme, spacing, typography, radii } from '@/theme';

import type { RootStackParamList } from '@/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export function LibraryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { loading, filter, sort, sortDirection, setFilter, setSort } = useLibrary();
  const {
    selectFolder,
    cancel,
    runInBackground,
    showProgressModal,
    importing,
    modalVisible,
    progress,
  } = useComicImport();

  // Subscribe to stable store slices only — derived lists must be memoized
  // (selectors that return new arrays break useSyncExternalStore / getSnapshot).
  const allComics = useLibraryStore((s) => s.comics);
  const comics = useMemo(
    () => pickVisibleComics(allComics, filter, sort, sortDirection),
    [allComics, filter, sort, sortDirection],
  );
  const continueComic = useMemo(() => pickContinueComic(allComics), [allComics]);

  const gap = spacing.md;
  const cardWidth = (width - spacing.lg * 2 - gap) / 2;

  const onSelectFolder = useCallback(() => {
    if (importing) {
      showProgressModal();
      return;
    }
    void selectFolder().catch((e: Error) => Alert.alert('Could not open folder', e.message));
  }, [importing, selectFolder, showProgressModal]);

  const progressBanner =
    importing && !modalVisible ? (
      <Pressable
        onPress={showProgressModal}
        style={[
          styles.banner,
          {
            backgroundColor: colors.accentSoft,
            borderColor: colors.accent,
            bottom: insets.bottom + (allComics.length === 0 ? 24 : 72),
          },
        ]}
      >
        <ActivityIndicator color={colors.accent} size="small" />
        <Text style={[styles.bannerText, { color: colors.accent }]} numberOfLines={1}>
          {progress?.message ?? 'Adding comics…'} · Tap for details
        </Text>
      </Pressable>
    ) : null;

  const progressModal = (
    <ImportProgressModal
      visible={modalVisible}
      progress={progress}
      onCancel={cancel}
      onRunInBackground={runInBackground}
    />
  );

  const header = useMemo(
    () => (
      <View>
        <Text style={[styles.brand, { color: colors.text }]}>Comic Reader</Text>
        <Text style={[styles.sub, { color: colors.muted }]}>Your personal shelf</Text>

        {continueComic ? (
          <ContinueCard
            comic={continueComic}
            onPress={() => navigation.navigate('Reader', { comicId: continueComic.id })}
          />
        ) : null}

        <LibraryControls
          filter={filter}
          sort={sort}
          sortDirection={sortDirection}
          onFilterChange={setFilter}
          onSortChange={setSort}
        />
      </View>
    ),
    [colors, continueComic, filter, sort, sortDirection, setFilter, setSort, navigation],
  );

  if (loading && allComics.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (allComics.length === 0) {
    return (
      <View
        style={[
          styles.center,
          {
            backgroundColor: colors.bg,
            paddingTop: insets.top,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <Text style={[styles.brand, { color: colors.text, textAlign: 'center' }]}>
          Comic Reader
        </Text>
        <Text style={[styles.empty, { color: colors.muted }]}>
          Select a folder that contains your CBZ comics. Everything in that folder will show up
          here.
        </Text>
        <Pressable
          onPress={onSelectFolder}
          style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
        >
          <Text style={styles.primaryText}>Select folder</Text>
        </Pressable>
        {progressBanner}
        {progressModal}
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <FlatList
        data={comics}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: insets.bottom + 88,
        }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={{ color: colors.muted, ...typography.body }}>
            No comics match this filter.
          </Text>
        }
        renderItem={({ item }) => (
          <ComicCard
            comic={item}
            width={cardWidth}
            onPress={() => navigation.navigate('ComicDetail', { comicId: item.id })}
            onLongPress={() => confirmDeleteComic(item.id, item.title)}
          />
        )}
        initialNumToRender={6}
        windowSize={7}
        removeClippedSubviews
      />

      <Pressable
        onPress={onSelectFolder}
        style={[styles.fab, { backgroundColor: colors.accent, bottom: insets.bottom + 16 }]}
      >
        <Text style={styles.fabText}>{importing ? 'Adding…' : '＋ Folder'}</Text>
      </Pressable>
      {progressBanner}
      {progressModal}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  brand: { ...typography.display, marginTop: spacing.md },
  sub: { ...typography.body, marginBottom: spacing.lg },
  empty: {
    ...typography.body,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  primaryBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  primaryText: { color: '#fff', ...typography.button },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.xl,
  },
  fabText: { color: '#fff', ...typography.button },
  banner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  bannerText: { ...typography.caption, flex: 1 },
});
