#!/bin/sh
# Build and inspect the static site locally. Run from anywhere:
#   ./scripts/preview.sh          # build, check, open, and serve on port 8000
#   ./scripts/preview.sh 4173     # use a different port
#   ./scripts/preview.sh --check  # build and check without starting a server

set -eu

SITE_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
MODE=${1:-serve}
PORT=8000

lan_ip() {
  interface=$(route -n get default 2>/dev/null | awk '/interface:/{ print $2; exit }')
  if [ -n "$interface" ] && command -v ipconfig >/dev/null 2>&1; then
    address=$(ipconfig getifaddr "$interface" 2>/dev/null || true)
    if [ -n "$address" ]; then
      printf '%s\n' "$address"
      return
    fi
  fi

  if command -v ifconfig >/dev/null 2>&1; then
    ifconfig | awk '/inet / && $2 !~ /^127\./ { print $2; exit }'
  fi
}

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

LAN_IP=$(lan_ip || true)
if [ -z "$LAN_IP" ]; then
  echo "Could not find a local-network IP address. Connect to Wi-Fi or Ethernet and try again." >&2
  exit 1
fi

LAN_URL="http://$LAN_IP:$PORT"

printf '%s' "$LAN_URL" | pbcopy
echo "Serving on your local network at $LAN_URL"
echo "The URL has been copied to your clipboard."
echo "Press Ctrl-C to stop."

python3 -m http.server "$PORT" --bind 0.0.0.0 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT INT TERM

open "$LAN_URL"
wait "$SERVER_PID"
