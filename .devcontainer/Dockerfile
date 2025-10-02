FROM node:22-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    git chromium curl jq ca-certificates \
    libnss3 libxss1 libasound2 libgbm1 libx11-xcb1 \
    fonts-noto-cjk xdg-utils tzdata \
 && rm -rf /var/lib/apt/lists/*

RUN npm install -g @aikidosec/safe-chain @openai/codex

USER node
