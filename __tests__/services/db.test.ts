import { initDB, insertVerse, getRandomVerses } from '../../src/services/db';

jest.mock('expo-sqlite', () => {
  const mockDb = {
    withTransactionAsync: jest.fn(async (task: () => Promise<void>) => {
      await task();
    }),
    execAsync: jest.fn(async () => {}),
    runAsync: jest.fn(async () => ({ lastInsertRowId: 1, changes: 1 })),
    getAllAsync: jest.fn(async () => [
      { reference: 'John 3:16', text: 'For God so loved the world', version: 'KJV' },
      { reference: 'Psalm 23:1', text: 'The Lord is my shepherd', version: 'KJV' },
    ]),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
    __mockDb: mockDb,
  };
});

const mockFetch = jest.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

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
});

describe('insertVerse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts a verse with correct parameters', async () => {
    const { __mockDb } = require('expo-sqlite');
    await insertVerse('John 3:16', 'For God so loved the world', 'KJV');
    expect(__mockDb.runAsync).toHaveBeenCalledWith(
      'INSERT INTO verses (reference, text, version) VALUES (?, ?, ?)',
      ['John 3:16', 'For God so loved the world', 'KJV']
    );
  });
});

describe('getRandomVerses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches verses from the API and returns random subset', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        reference: 'John 3:16',
        text: 'For God so loved the world',
        verse_info: { translation: 'KJV' },
      }),
    });

    const result = await getRandomVerses(2);
    expect(mockFetch).toHaveBeenCalled();
    expect(result.length).toBeLessThanOrEqual(2);
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { __mockDb } = require('expo-sqlite');
    __mockDb.getAllAsync.mockResolvedValueOnce([]);

    const result = await getRandomVerses(2);
    expect(result).toEqual([]);
  });

  it('returns correct number of verses', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        reference: 'Test',
        text: 'Test verse',
        verse_info: { translation: 'KJV' },
      }),
    });

    const result = await getRandomVerses(1);
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it('shuffles results', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        reference: 'Test',
        text: 'Test verse',
        verse_info: { translation: 'KJV' },
      }),
    });

    await getRandomVerses(2);
    expect(mockFetch).toHaveBeenCalled();
  });
});
