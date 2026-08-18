import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('comicreader.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS comics (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          series TEXT,
          sourceUri TEXT,
          sourceFileName TEXT,
          coverPath TEXT NOT NULL,
          pagesDir TEXT NOT NULL,
          pageCount INTEGER NOT NULL,
          currentPage INTEGER NOT NULL DEFAULT 0,
          spreadHalf TEXT NOT NULL DEFAULT 'full',
          isRead INTEGER NOT NULL DEFAULT 0,
          isFavorite INTEGER NOT NULL DEFAULT 0,
          fitMode TEXT NOT NULL DEFAULT 'screen',
          readingDirection TEXT NOT NULL DEFAULT 'ltr',
          lastReadAt INTEGER,
          importedAt INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);

      const comicCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(comics)');
      if (!comicCols.some((col) => col.name === 'sourceFileName')) {
        await db.execAsync('ALTER TABLE comics ADD COLUMN sourceFileName TEXT');
      }

      return db;
    })();
  }
  return dbPromise;
}
