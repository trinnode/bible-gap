import { checkForUpdate, getApkDownloadUrl } from '../../src/services/update';

const mockFetch = jest.fn();
globalThis.fetch = mockFetch as unknown as typeof fetch;

describe('checkForUpdate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns release data when a new version is available', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        tag_name: 'v1.1.0',
        html_url: 'https://github.com/trinnode/bible-gap/releases/tag/v1.1.0',
        assets: [
          {
            name: 'bible-gap-v1.1.0.apk',
            browser_download_url: 'https://github.com/trinnode/bible-gap/releases/download/v1.1.0/bible-gap-v1.1.0.apk',
          },
        ],
      }),
    });

    const result = await checkForUpdate();
    expect(result).not.toBeNull();
    expect(result?.tag_name).toBe('v1.1.0');
  });

  it('returns null when no APK asset exists', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        tag_name: 'v1.1.0',
        html_url: 'https://github.com/trinnode/bible-gap/releases/tag/v1.1.0',
        assets: [],
      }),
    });

    const result = await checkForUpdate();
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await checkForUpdate();
    expect(result).toBeNull();
  });

  it('returns null on non-OK response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    const result = await checkForUpdate();
    expect(result).toBeNull();
  });
});

describe('getApkDownloadUrl', () => {
  it('returns the APK download URL from release', () => {
    const release = {
      tag_name: 'v1.0.0',
      html_url: 'https://example.com',
      assets: [
        {
          name: 'app.apk',
          browser_download_url: 'https://example.com/app.apk',
        },
      ],
    };
    expect(getApkDownloadUrl(release)).toBe('https://example.com/app.apk');
  });

  it('returns null when no APK asset exists', () => {
    const release = {
      tag_name: 'v1.0.0',
      html_url: 'https://example.com',
      assets: [],
    };
    expect(getApkDownloadUrl(release)).toBeNull();
  });
});
