#!/usr/bin/env bash
#
# Prepare a WordPress.org SVN layout (trunk / tags / assets) for warder-cookie-consent.
# Produces a staging folder you copy into a real `svn co` checkout.
#
# Marketing assets are read from .wordpress-org/ in the repo (version-controlled,
# excluded from the plugin zip via .distignore). Re-run anytime; the bundle is
# rebuilt and the version is read from the plugin header.
#
#   bash bin/prepare-svn.sh [STAGING_DIR]
#
set -euo pipefail

# Repo root = parent of this script's bin/ dir.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
ASSETS="$REPO/.wordpress-org"
STAGING="${1:-$REPO/../warder-svn-staging}"

cd "$REPO"

# Canonical version from the plugin header (what WordPress.org reads).
VERSION="$(grep -m1 -E '^\s*\*\s*Version:' warder-cookie-consent.php \
  | sed -E 's/.*Version:[[:space:]]*//' | tr -d '[:space:]')"
echo "==> Plugin version: $VERSION"

# Fresh build of the compiled bundle.
echo "==> Building dist/cookieconsent.bundle.js ..."
npx webpack >/dev/null

# Clean staging.
rm -rf "$STAGING"
mkdir -p "$STAGING/trunk" "$STAGING/tags" "$STAGING/assets"

# Build the filtered plugin payload the SAME way the release workflow does
# (zip with -x@.distignore), then expand it into trunk/.
echo "==> Assembling trunk/ via .distignore filter ..."
TMPDIR="$(mktemp -d)"
zip -r -q "$TMPDIR/payload.zip" . -x@.distignore
unzip -q "$TMPDIR/payload.zip" -d "$STAGING/trunk"
rm -rf "$TMPDIR"

# Frozen release tag = exact copy of trunk.
echo "==> Copying trunk/ -> tags/$VERSION/ ..."
cp -R "$STAGING/trunk" "$STAGING/tags/$VERSION"

# Marketing assets (banners, icon, screenshots) live in the top-level assets/,
# NOT in trunk and NOT in the plugin zip.
echo "==> Copying marketing assets from .wordpress-org/ ..."
cp "$ASSETS"/*.png "$STAGING/assets/"
[ -f "$ASSETS/icon.svg" ] && cp "$ASSETS/icon.svg" "$STAGING/assets/"

echo
echo "==> Layout ready at: $STAGING"
echo
( cd "$STAGING" && find . -maxdepth 2 -mindepth 1 | sort )
echo
cat <<EOF
=== Next steps (once your SVN commit access is active) ===

  svn co https://plugins.svn.wordpress.org/warder-cookie-consent warder-svn

  cp -R "$STAGING/trunk/."       warder-svn/trunk/
  cp -R "$STAGING/tags/$VERSION" warder-svn/tags/
  cp -R "$STAGING/assets/."      warder-svn/assets/

  cd warder-svn
  svn add --force trunk tags assets
  svn status                     # sanity-check what will be committed
  svn ci -m "Release $VERSION" --username YOUR_WP_ORG_USERNAME
EOF
