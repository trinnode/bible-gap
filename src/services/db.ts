import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('bible_gap.db');

export const initDB = async () => {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS verses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL,
        text TEXT NOT NULL,
        version TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verseId INTEGER,
        correct INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  });
};

export const insertVerse = async (reference: string, text: string, version: string) => {
  await db.runAsync(
    'INSERT INTO verses (reference, text, version) VALUES (?, ?, ?)',
    [reference, text, version]
  );
};

export const getRandomVerses = async (count: number) => {
  const verseRefs = [
    'john-3-16',
    'psalm-23-1',
    'proverbs-3-5',
    'romans-8-28',
    'philippians-4-13',
    'genesis-1-1',
    'matthew-5-3',
    'isaiah-40-31',
    'jeremiah-29-11',
    '1-corinthians-13-4',
  ];

  for (const ref of verseRefs) {
    try {
      const res = await fetch(`https://bible-api.com/${ref}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      await insertVerse(data.reference, data.text, data.verse_info?.translation || 'NIV');
    } catch (e) {
      console.warn(`Failed to fetch ${ref}`, e);
    }
  }

  const all = await db.getAllAsync<{ reference: string; text: string; version: string }>(
    'SELECT reference, text, version FROM verses'
  );
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
