#!/usr/bin/env bash
set -euo pipefail
mkdir -p /tmp/chrome-profile /tmp/xdg
export XDG_RUNTIME_DIR=/tmp/xdg
pkill -f "chromium.*remote-debugging-port=9222" 2>/dev/null || true
nohup chromium \
  --headless=new \
  --remote-debugging-address=0.0.0.0 \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-profile \
  --no-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  --no-zygote \
  --single-process \
  >/tmp/chromium-devtools.log 2>&1 &
