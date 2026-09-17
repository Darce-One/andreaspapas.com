#!/bin/sh
# Build and inspect the static site locally. Run from anywhere:
#   ./scripts/preview.sh          # build, check, then serve on port 8000
#   ./scripts/preview.sh 4173     # use a different port
#   ./scripts/preview.sh --check  # build and check without starting a server

set -eu

SITE_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
MODE=${1:-serve}
PORT=8000

if [ "$MODE" != "--check" ]; then
  PORT=$MODE
fi

cd "$SITE_ROOT"

echo "Building Markdown content…"
node scripts/build-content.mjs

echo "Checking JavaScript syntax…"
node --check script.js
node --check music-share/music-share.js

echo "Checking generated pages…"
test -f data/writings.json
test -f data/projects.json
test -d pages/writings
test -d pages/projects

echo "Local checks passed."

if [ "$MODE" = "--check" ]; then
  exit 0
fi

case "$PORT" in
  *[!0-9]*|'')
    echo "Usage: $0 [port|--check]" >&2
    exit 2
    ;;
esac

echo "Serving at http://localhost:$PORT"
echo "Press Ctrl-C to stop."
exec python3 -m http.server "$PORT"
