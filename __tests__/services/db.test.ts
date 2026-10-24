import { initDB, insertVerse, getRandomVerses, warmUpVerses } from '../../src/services/db';
import { BUNDLED_VERSES } from '../../src/data/verses';

jest.mock('expo-sqlite', () => {
  const mockDb = {
    withTransactionAsync: jest.fn(async (task: () => Promise<void>) => {
      await task();
    }),
    execAsync: jest.fn(async () => {}),
    runAsync: jest.fn(async () => ({ lastInsertRowId: 1, changes: 1 })),
    getAllAsync: jest.fn(async () => []),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
    __mockDb: mockDb,
  };
});

const mockFetch = jest.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

const seededDb = () => {
  const { __mockDb } = require('expo-sqlite');
  __mockDb.getAllAsync.mockResolvedValueOnce([{ n: 0 }]);
  return __mockDb;
};

describe('initDB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates tables successfully', async () => {
    await expect(initDB()).resolves.toBeUndefined();
  });

  it('wraps operations in a transaction', async () => {
    const { __mockDb } = require('expo-sqlite');
    await initDB();
    expect(__mockDb.withTransactionAsync).toHaveBeenCalledTimes(1);
  });

  it('executes CREATE TABLE statements', async () => {
    const { __mockDb } = require('expo-sqlite');
    await initDB();
    expect(__mockDb.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS verses')
    );
    expect(__mockDb.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS scores')
    );
  });

  it('seeds bundled verses when the table is empty', async () => {
    const __mockDb = seededDb();
    await initDB();
    expect(__mockDb.runAsync).toHaveBeenCalledTimes(BUNDLED_VERSES.length);
    expect(__mockDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO verses (reference, text, version) VALUES (?, ?, ?)',
      [BUNDLED_VERSES[0].reference, BUNDLED_VERSES[0].text, BUNDLED_VERSES[0].version]
    );
  });

  it('does not re-seed when verses already exist', async () => {
    const { __mockDb } = require('expo-sqlite');
    __mockDb.getAllAsync.mockResolvedValueOnce([{ n: 5 }]);
    await initDB();
    expect(__mockDb.runAsync).not.toHaveBeenCalled();
  });
});

describe('insertVerse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts a verse when it does not exist yet', async () => {
    const { __mockDb } = require('expo-sqlite');
    __mockDb.getAllAsync.mockResolvedValueOnce([]);
    await insertVerse('John 3:16', 'For God so loved the world', 'KJV');
    expect(__mockDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO verses (reference, text, version) VALUES (?, ?, ?)',
      ['John 3:16', 'For God so loved the world', 'KJV']
    );
  });

  it('skips insertion when the reference already exists', async () => {
    const { __mockDb } = require('expo-sqlite');
    __mockDb.getAllAsync.mockResolvedValueOnce([{ id: 1 }]);
    await insertVerse('John 3:16', 'For God so loved the world', 'KJV');
    expect(__mockDb.runAsync).not.toHaveBeenCalled();
  });
});

describe('getRandomVerses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads from the database without hitting the network', async () => {
    const { __mockDb } = require('expo-sqlite');
    __mockDb.getAllAsync.mockResolvedValueOnce([
      { reference: 'John 3:16', text: 'For God so loved the world', version: 'KJV' },
      { reference: 'Psalm 23:1', text: 'The Lord is my shepherd', version: 'KJV' },
    ]);

    const result = await getRandomVerses(2);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty('reference');
    expect(result[0]).toHaveProperty('text');
  });

  it('returns at most the requested count', async () => {
    const { __mockDb } = require('expo-sqlite');
    __mockDb.getAllAsync.mockResolvedValueOnce([
      { reference: 'A', text: 'a', version: 'KJV' },
      { reference: 'B', text: 'b', version: 'KJV' },
      { reference: 'C', text: 'c', version: 'KJV' },
    ]);

    const result = await getRandomVerses(1);
    expect(result.length).toBe(1);
  });

  it('returns an empty array when the database is empty', async () => {
    const result = await getRandomVerses(3);
    expect(result).toEqual([]);
  });
});

describe('warmUpVerses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches missing verses from the API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        reference: 'John 3:16',
        text: 'For God so loved the world',
        verse_info: { translation: 'KJV' },
      }),
    });

    await warmUpVerses();
    expect(mockFetch).toHaveBeenCalled();
  });

  it('swallows network errors so the app keeps working offline', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    await expect(warmUpVerses()).resolves.toBeUndefined();
  });
});
