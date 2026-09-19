#!/usr/bin/env bash
# Cloudflare Workers Builds — legacy frontend build on Node 10.24.1 + npm 6.14.12.
# Does NOT switch the whole pipeline permanently to Node 10 (Wrangler still needs modern Node).
#
# Used as Workers Builds "Build command" with:
#   SKIP_DEPENDENCY_INSTALL=true
# Deploy command stays: npx wrangler deploy  (image Node 22/24)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NODE10_VERSION="10.24.1"
NVM_VERSION="v0.40.1"

echo "==> our-little-story Cloudflare build"
echo "    cwd: $ROOT"
echo "    host node (image): $(command -v node >/dev/null && node -v || echo none)"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "==> Installing nvm ${NVM_VERSION}"
  curl -fsSL "https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh" | bash
fi

# shellcheck disable=SC1090
. "$NVM_DIR/nvm.sh"

echo "==> Installing/using Node ${NODE10_VERSION} (matches local production build)"
nvm install "$NODE10_VERSION"
nvm use "$NODE10_VERSION"

NODE_V="$(node -v)"
NPM_V="$(npm -v)"
echo "==> Active toolchain: node ${NODE_V} / npm ${NPM_V}"

if [ "$NODE_V" != "v${NODE10_VERSION}" ]; then
  echo "ERROR: expected node v${NODE10_VERSION}, got ${NODE_V}" >&2
  exit 1
fi

# npm that ships with 10.24.1 is 6.14.12
case "$NPM_V" in
  6.14.*) ;;
  *)
    echo "WARN: expected npm 6.14.x (got ${NPM_V}); continuing" >&2
    ;;
esac

# Prefer deterministic install from npm 6 lockfile (lockfileVersion 1).
# Falls back to npm install if ci is unavailable.
echo "==> npm ci (Node 10 / npm 6, --ignore-engines)"
if ! npm ci --ignore-engines; then
  echo "WARN: npm ci failed; falling back to npm install --ignore-engines" >&2
  npm install --ignore-engines
fi

echo "==> Production landing build → dist/land-story"
npm run build --prefix landings/land-story

if [ ! -f dist/land-story/index.html ]; then
  echo "ERROR: dist/land-story/index.html missing after build" >&2
  exit 1
fi

echo "==> Frontend build OK ($(du -sh dist/land-story | awk '{print $1}'))"
echo "==> Next: Deploy command should run on image Node 22/24: npx wrangler deploy"
