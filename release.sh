#!/usr/bin/env bash
# ============================================================
# release.sh — Build an Android APK with EAS, then publish it
# as a GitHub release on trinnode/bible-gap.
#
# Usage:
#   ./release.sh                  # build + release
#   ./release.sh --dry-run        # build only, skip GitHub release
#   ./release.sh --skip-build     # release the last EAS build (no new build)
# ============================================================
set -euo pipefail

# Stale GH_TOKEN / GITHUB_TOKEN env vars override gh's keyring credentials.
# Unset them so gh uses the logged-in keyring account (trinnode).
unset GH_TOKEN GITHUB_TOKEN 2>/dev/null || true

REPO="trinnode/bible-gap"
PROFILE="production"
PLATFORM="android"
VERSION=$(node -p "require('./package.json').version")
TAG="v${VERSION}"
APK_DIR="release-artifacts"
APK_PATH="${APK_DIR}/bible-gap-${TAG}.apk"
DRY_RUN=false
SKIP_BUILD=false

for arg in "$@"; do
  case "$arg" in
    --dry-run)    DRY_RUN=true ;;
    --skip-build) SKIP_BUILD=true ;;
    *) echo "Unknown flag: $arg"; exit 1 ;;
  esac
done

log()  { printf "\n\033[1;34m▶ %s\033[0m\n" "$*"; }
ok()   { printf "\033[1;32m✔ %s\033[0m\n" "$*"; }
err()  { printf "\033[1;31m✘ %s\033[0m\n" "$*" >&2; }

# ----------------------------------------------------------
# 1. Build (unless --skip-build)
# ----------------------------------------------------------
if [ "$SKIP_BUILD" = false ]; then
  log "Building ${PLATFORM} APK (profile: ${PROFILE})…"

  # --json + --wait blocks until the build finishes, then prints one JSON object.
  # We tee it to a temp file so we can parse while still showing output.
  TMP_JSON=$(mktemp)
  trap 'rm -f "$TMP_JSON"' EXIT

  EAS_BUILD_NO_EXPO_GO_WARNING=true eas build \
    --platform "$PLATFORM" \
    --profile "$PROFILE" \
    --wait \
    --json > "$TMP_JSON" 2>"${TMP_JSON}.err" || {
      err "EAS build failed. Last 30 lines of stderr:"
      tail -30 "${TMP_JSON}.err"
      exit 1
    }

  # Extract the artifact URL. EAS JSON has artifacts.buildUrl (or buildUrl at top level).
  BUILD_URL=$(node -e "
    const raw = require('fs').readFileSync(process.argv[1],'utf8');
    // EAS may output an array or a single object
    let data = JSON.parse(raw);
    if (Array.isArray(data)) data = data[0];
    const url = data?.artifacts?.buildUrl || data?.buildUrl || '';
    if (!url) { console.error('No artifact URL found in:', JSON.stringify(data).slice(0,400)); process.exit(1); }
    console.log(url);
  " "$TMP_JSON") || { err "Could not extract artifact URL"; exit 1; }

  BUILD_ID=$(node -e "
    const raw = require('fs').readFileSync(process.argv[1],'utf8');
    let data = JSON.parse(raw);
    if (Array.isArray(data)) data = data[0];
    console.log(data?.id || 'unknown');
  " "$TMP_JSON")

  ok "Build ${BUILD_ID} finished"
  ok "Artifact: ${BUILD_URL}"
else
  log "Skipping build — reusing last EAS artifact"
  # Last build URL from a previous run, or prompt the user
  BUILD_URL="${EAS_ARTIFACT_URL:-}"
  if [ -z "$BUILD_URL" ]; then
    err "Set EAS_ARTIFACT_URL to the artifact URL, or drop --skip-build"
    exit 1
  fi
fi

# ----------------------------------------------------------
# 2. Download the APK
# ----------------------------------------------------------
log "Downloading APK → ${APK_PATH}"
mkdir -p "$APK_DIR"
curl -fSL -o "$APK_PATH" "$BUILD_URL" || { err "Download failed"; exit 1; }
ok "Downloaded $(du -h "$APK_PATH" | cut -f1)"

# ----------------------------------------------------------
# 3. Publish GitHub release
# ----------------------------------------------------------
if [ "$DRY_RUN" = true ]; then
  log "--dry-run: skipping GitHub release. APK at ${APK_PATH}"
  exit 0
fi

log "Creating GitHub release ${TAG}…"

# Get commit sha of current HEAD for the release target
COMMIT_SHA=$(git rev-parse HEAD)

# Generate release notes from commits since the last tag (or all if first release)
if git describe --tags --abbrev=0 >/dev/null 2>&1; then
  PREV_TAG=$(git describe --tags --abbrev=0)
  RELEASE_NOTES=$(git log --pretty=format:"- %s (%h)" "${PREV_TAG}..HEAD")
else
  RELEASE_NOTES=$(git log --pretty=format:"- %s (%h)" --reverse | head -30)
fi

# Create release (or fail if it already exists — then upload to it)
if gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
  ok "Release ${TAG} already exists — uploading APK to it"
  gh release upload "$TAG" "$APK_PATH" --repo "$REPO" --clobber
else
  gh release create "$TAG" "$APK_PATH" \
    --repo "$REPO" \
    --target "$COMMIT_SHA" \
    --title "Bible Gap ${TAG}" \
    --notes "$(printf '## Bible Gap %s\n\n%s\n\n### Download\nInstall the APK directly on your Android device (allow "Install from unknown sources" when prompted).\n\n**SHA:** `%s`' "$TAG" "$RELEASE_NOTES" "$COMMIT_SHA")" \
    --verify-tag 2>/dev/null || \
  gh release create "$TAG" "$APK_PATH" \
    --repo "$REPO" \
    --target "$COMMIT_SHA" \
    --title "Bible Gap ${TAG}" \
    --notes "$(printf '## Bible Gap %s\n\n%s\n\n### Download\nInstall the APK directly on your Android device (allow "Install from unknown sources" when prompted).\n\n**SHA:** `%s`' "$TAG" "$RELEASE_NOTES" "$COMMIT_SHA")"
fi

ok "Release published: https://github.com/${REPO}/releases/tag/${TAG}"
