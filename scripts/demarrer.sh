#!/usr/bin/env bash
# VERQIA PILOT — démarrage (macOS / Linux)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
(cd "$ROOT/backend" && python3 -m uvicorn app.main:app --reload --port 8000) &
(cd "$ROOT/frontend" && npm run dev)
