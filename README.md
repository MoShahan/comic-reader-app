# Comic Reader

A personal **Expo / React Native** comic reader for your phone.

Select a folder of local **CBZ** files, browse a cover-based library, and read with progress that sticks - without accounts, cloud sync, or analytics.

<p align="center">
  <img alt="Tests" src="https://img.shields.io/badge/tests-Jest-C21325?style=flat-square" />
  <img alt="Lint" src="https://img.shields.io/badge/lint-ESLint-4B32C3?style=flat-square" />
  <img alt="Expo" src="https://img.shields.io/badge/Expo-SDK%2057-000020?style=flat-square" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-green?style=flat-square" />
</p>

---

## Why this exists

Built for **personal use on your own device** (Expo Go). Comics stay on your phone. Reading progress and preferences are saved locally with SQLite. **Mark as read is always a conscious choice** - finishing the last page never auto-marks a comic.

---

## Features

### Library

|                  |                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Cover grid       | Each comic shows its **first page** as cover art                                          |
| Continue reading | Jump back to the last unfinished issue                                                    |
| Organize         | Filters (all / unread / reading / finished / favorites), sort (recent / title / progress) |
| Series           | Light grouping inferred from titles (e.g. `Batman #12`)                                   |
| Folder library   | **Select a folder** (Android) - all CBZ/ZIP files in it appear on your shelf              |
| Delete           | Confirmation dialog → remove from app **and** try to delete the original file on device   |

### Reader

|              |                                                                          |
| ------------ | ------------------------------------------------------------------------ |
| Navigation   | Swipe left/right or up/down · tap edge zones · always LTR page order    |
| Progress     | Page position (and double-page half) saved as you read                   |
| Spreads      | Wide pages auto-split in portrait when enabled                           |
| Controls     | Scrubber, pinch / double-tap zoom, brightness dimmer, dark reader chrome |
| Comfort      | Keep screen awake while reading · pages always fit and centered on screen |
| Mark as read | Manual only - from detail screen or reader chrome                        |

### App

|         |                                                                 |
| ------- | --------------------------------------------------------------- |
| Themes  | Light, dark, or follow system                                   |
| Storage | See how much space the library uses · repair / re-extract pages |
| Privacy | No accounts · no comic uploads · no analytics                   |

---

## Supported formats

| Format            | Status                                                      |
| ----------------- | ----------------------------------------------------------- |
| **CBZ** / **ZIP** | Supported in Expo Go                                        |
| **CBR** (RAR)     | Not supported in Expo Go - convert to CBZ first (see below) |

### Why CBR is hard

**CBZ** is a ZIP archive of images. ZIP is well supported in JavaScript, so ComicReader can unpack pages with libraries like `fflate` inside Expo Go.

**CBR** is a **RAR** archive. RAR is a proprietary format:

- There is no reliable, pure-JavaScript RAR unpacker suitable for production (especially newer RAR5 archives).
- Unpacking needs a **native** UnRAR / libarchive library on iOS and Android.
- Native modules require a **custom Expo dev build** (or ejecting), not the standard **Expo Go** app.
- UnRAR also has **licensing** constraints that complicate shipping it in an open-source / personal build.

So CBR support is possible later with a native build, but it is intentionally deferred. Converting CBR → CBZ on a PC is the practical path for Expo Go.

### Convert CBR → CBZ (Windows)

1. Open the `.cbr` in [7-Zip](https://www.7-zip.org/) or WinRAR
2. Extract all page images
3. Zip the folder and rename `.zip` → `.cbz`
4. Put the CBZ in your comics folder and select that folder in ComicReader

---

## Quick start

**Requirements:** Node.js 22+, phone with [Expo Go](https://expo.dev/go), same Wi‑Fi as your computer.

```bash
git clone <your-repo-url>
cd ComicReader
npm install
npm start
```

Scan the QR code with Expo Go. On Android, use the Expo Go app; on iOS, the Camera app works with Expo Go installed.

| Command                           | What it does                   |
| --------------------------------- | ------------------------------ |
| `npm start`                       | Start Expo dev server          |
| `npm run android` / `ios` / `web` | Platform shortcuts             |
| `npm test`                        | Unit tests                     |
| `npm run lint`                    | ESLint (includes import order) |
| `npm run lint:fix`                | ESLint with auto-fix           |
| `npm run typecheck`               | TypeScript check               |

---

## How to use

1. **Select folder** (Android) - pick a folder of CBZ/ZIP comics; they appear on your shelf
2. Open a cover → **Start** or **Continue** reading
3. Tap the **center** of a page for controls (scrubber, mark read, dimmer)
4. Tap edges or swipe to turn pages
5. Use **Mark as read** when _you_ decide you’re done
6. **Delete** asks for confirmation, then clears the app copy and attempts to remove the original file

### Delete behavior

After you confirm delete:

1. Extracted pages in the app sandbox are removed
2. The SQLite library row is removed
3. The original file is deleted when the OS allows it

If the system blocks deleting the original (common with some Android `content://` URIs), the comic is still removed from ComicReader and you’ll get a short alert to delete the file manually.

> Folder selection uses Android’s Storage Access Framework. iOS folder picking is not available in this Expo Go build yet.

---

## Storage & privacy

| Data                  | Where it lives                                     |
| --------------------- | -------------------------------------------------- |
| Page images           | App private storage (`documentDirectory/comics/…`) |
| Progress & settings   | Local SQLite (`comicreader.db`)                    |
| Folder scan / extract | Temporary work under app storage during add        |

- Originals on your phone are left alone until you confirm **Delete**
- No network calls for comics, no telemetry, no accounts

---

## Project structure

```text
src/
├── components/     # Cards, reader page, overlay, import modal
├── db/             # SQLite (comics + settings)
├── hooks/          # Library, import, reader state
├── library/        # Pure selectors (filter, sort, spreads)
├── navigation/     # Tabs + stack
├── screens/        # Library, Detail, Reader, Settings
├── services/       # Folder add, extract, delete, repair, storage
├── store/          # Zustand library UI state
├── theme/          # Light/dark tokens + provider
└── types/          # Shared TypeScript types
```

---

## Testing & CI

```bash
npm test
npm run lint
npm run typecheck
```

GitHub Actions on every push and pull request:

| Workflow                                                                          | Checks                                  |
| --------------------------------------------------------------------------------- | --------------------------------------- |
| [Comic Reader - Unit Tests & Typecheck](.github/workflows/tests.yml)              | TypeScript (`tsc`) + Jest unit tests    |
| [Comic Reader - ESLint (Import Order & Code Quality)](.github/workflows/lint.yml) | ESLint, including import groups / order |

The job fails if any check fails.

**Pre-commit:** [Husky](https://typicode.github.io/husky/) runs [lint-staged](https://github.com/lint-staged/lint-staged) on `git commit`. Staged `.js` / `.jsx` / `.ts` / `.tsx` files are passed through `eslint --fix` (import order, groups, and other auto-fixable rules). Remaining lint errors block the commit. After `npm install`, the hook is installed via the `prepare` script.

---

## Tech stack

- **Expo SDK 57** · React Native · TypeScript
- **expo-sqlite** for library metadata & settings
- **expo-file-system** + **fflate** for CBZ extract
- **React Navigation** · **Zustand** · **expo-image**

---

## License

MIT - see [LICENSE](LICENSE).
