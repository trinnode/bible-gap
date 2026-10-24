const GITHUB_REPO = 'trinnode/bible-gap';
const API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;

interface LatestRelease {
  tag_name: string;
  html_url: string;
  assets: { name: string; browser_download_url: string }[];
}

export const checkForUpdate = async (): Promise<LatestRelease | null> => {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return null;
    const release: LatestRelease = await res.json();
    const apkAsset = release.assets.find(a => a.name.endsWith('.apk'));
    if (!apkAsset) return null;
    return release;
  } catch {
    return null;
  }
};

export const getApkDownloadUrl = (release: LatestRelease): string | null => {
  const apk = release.assets.find(a => a.name.endsWith('.apk'));
  return apk ? apk.browser_download_url : null;
};
