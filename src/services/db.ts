import { openDatabaseSync } from 'expo-sqlite';
import { BUNDLED_VERSES, BundledVerse } from '../data/verses';

const db = openDatabaseSync('bible_gap.db');

const FETCH_TIMEOUT_MS = 5000;
const NETWORK_REFS = [
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

    const row = await db.getAllAsync<{ n: number }>('SELECT COUNT(*) as n FROM verses');
    if (!row[0]?.n) {
      for (const v of BUNDLED_VERSES) {
        await db.runAsync(
          'INSERT INTO verses (reference, text, version) VALUES (?, ?, ?)',
          [v.reference, v.text, v.version]
        );
      }
    }
  });
};

export const insertVerse = async (reference: string, text: string, version: string) => {
  const existing = await db.getAllAsync<{ id: number }>(
    'SELECT id FROM verses WHERE reference = ?',
    [reference]
  );
  if (existing.length) return;
  await db.runAsync(
    'INSERT INTO verses (reference, text, version) VALUES (?, ?, ?)',
    [reference, text, version]
  );
};

const fetchWithTimeout = async (url: string): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const enrichFromNetwork = async () => {
  await Promise.all(
    NETWORK_REFS.map(async ref => {
      try {
        const res = await fetchWithTimeout(`https://bible-api.com/${ref}`);
        if (!res.ok) return;
        const data = await res.json();
        await insertVerse(data.reference, data.text, data.verse_info?.translation || 'KJV');
      } catch {
        // Offline or slow — bundled verses already cover the game.
      }
    })
  );
};

export const getRandomVerses = async (count: number): Promise<BundledVerse[]> => {
  const all = await db.getAllAsync<{ reference: string; text: string; version: string }>(
    'SELECT reference, text, version FROM verses'
  );
  const shuffled = all.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const warmUpVerses = async () => {
  try {
    await enrichFromNetwork();
  } catch {
    // Non-fatal: bundled verses are already seeded.
  }
};
