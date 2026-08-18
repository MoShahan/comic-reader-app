import { Alert } from 'react-native';

import {
  clearLibrarySandbox,
  deleteComicFromApp,
  deleteComicFromDevice,
} from '@/services/deleteComic';
import { buildDeleteUserMessage } from '@/services/deleteMessaging';
import { useLibraryStore } from '@/store/libraryStore';

import type { DeleteResult } from '@/types/comic';

type ConfirmDeleteOptions = {
  onDeleted?: () => void;
};

async function finishDelete(
  comicId: string,
  result: DeleteResult,
  options: ConfirmDeleteOptions,
  titleWhenPartial: string,
) {
  useLibraryStore.getState().removeLocal(comicId);
  await useLibraryStore.getState().refresh();
  options.onDeleted?.();
  const message = buildDeleteUserMessage(result);
  if (message && result.appDeleted && !result.deviceDeleted && result.deviceDeleteError) {
    Alert.alert(titleWhenPartial, message);
  }
}

/** Shared confirm → choose app-only or app+device delete. */
export function confirmDeleteComic(
  comicId: string,
  title: string,
  options: ConfirmDeleteOptions = {},
) {
  Alert.alert(
    'Delete this comic?',
    `“${title}”\n\n• From this app - remove from your shelf (keeps the CBZ on your device)\n• From device - remove from the app and delete the original CBZ file`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'From this app',
        onPress: () => {
          void (async () => {
            const result = await deleteComicFromApp(comicId);
            await finishDelete(comicId, result, options, 'Deleted from app');
          })();
        },
      },
      {
        text: 'From device',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            const result = await deleteComicFromDevice(comicId);
            await finishDelete(comicId, result, options, 'Deleted from library');
          })();
        },
      },
    ],
  );
}

/** Clear all extracted comics from app storage. Originals on device are kept. */
export function confirmClearLibrarySandbox(options: { onCleared?: () => void } = {}) {
  Alert.alert(
    'Clear app library?',
    'This deletes every comic from Comic Reader’s private storage (extracted pages and copies). Your original CBZ files in the folder you selected are not deleted. This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear sandbox',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await clearLibrarySandbox();
            await useLibraryStore.getState().refresh();
            options.onCleared?.();
            Alert.alert(
              'Library cleared',
              'App sandbox storage was freed. Select a folder again to re-add comics.',
            );
          })();
        },
      },
    ],
  );
}
