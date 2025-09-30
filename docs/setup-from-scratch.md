# create-next-app から本プロジェクトを再構築する手順

この手順書は、新規環境で `create-next-app` からスタートし、本リポジトリと同じ開発体制（Next.js + MUI + TanStack Query + MSW + TypeSpec + Orval + Vitest）を再現することを目的としています。

## 0. 事前準備
- Node.js 20 LTS 以上 / npm 10 以上
- Git（任意）
- `npx` が利用できること

```bash
node --version
npm --version
```

## 1. プロジェクトの初期化
```bash
mkdir sample-nextjs
cd sample-nextjs
npx create-next-app@latest product --ts --eslint --app --src-dir --import-alias "@/*" --use-npm
```
- 生成後は `cd product` して作業
- 既定で作成されるファイルは残したままで問題ありません（後で上書きします）

## 2. 依存パッケージの追加
### 2-1. ランタイム依存
```bash
npm install \
  @emotion/cache @emotion/react @emotion/styled \
  @mui/icons-material @mui/material @mui/material-nextjs \
  @tanstack/react-query axios dotenv lru-cache
```

### 2-2. 開発・ビルド補助
```bash
npm install -D \
  @eslint/eslintrc @testing-library/jest-dom @testing-library/react @testing-library/user-event \
  @typespec/compiler @typespec/openapi3 cross-env jsdom msw orval vitest
```
（TypeScript, ESLint, `@types/*` は create-next-app で既に導入済み）

## 3. スクリプトと設定の調整
### 3-1. `package.json`
`scripts` を下記に差し替えます。
```jsonc
{
  "scripts": {
    "dev": "cross-env APP_ENV=local NEXT_PUBLIC_API_MOCK=true next dev --turbopack",
    "dev:stg": "cross-env APP_ENV=staging NEXT_PUBLIC_API_MOCK=false next dev --turbopack",
    "build": "cross-env APP_ENV=production NEXT_PUBLIC_API_MOCK=false next build --turbopack",
    "start": "cross-env APP_ENV=production NEXT_PUBLIC_API_MOCK=false next start",
    "lint": "eslint",
    "openapi": "tsp compile tsp --emit @typespec/openapi3",
    "client": "orval --config orval.config.ts",
    "gen": "npm run openapi && npm run client",
    "test:unit": "vitest run",
    "test:integration": "vitest run tests/integration"
  }
}
```

### 3-2. `.env.example`
ルート直下にファイルを作成し、環境ごとにコピーします。
```env
APP_ENV=local
NEXT_PUBLIC_API_BASE_URL=https://example.com
NEXT_PUBLIC_API_MOCK=true
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SERVER_CACHE_TTL_MS=60000
```

### 3-3. `next.config.mjs`
```javascript
import { config as loadEnv } from "dotenv";

const resolvedAppEnv = process.env.APP_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "local");

loadEnv({ path: `.env.${resolvedAppEnv}` });
loadEnv();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    APP_ENV: resolvedAppEnv,
  },
};

export default nextConfig;
```

### 3-4. `eslint.config.mjs`
Flat Config 版 ESLint を設定します。
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
```

### 3-5. `vitest.config.ts`
```typescript
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    css: true,
    deps: {
      optimizer: {
        web: {
          include: [
            "@mui/material",
            "@mui/icons-material",
            "@mui/material-nextjs",
            "@emotion/react",
            "@emotion/styled",
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

## 4. TypeSpec & Orval のセットアップ
### 4-1. TypeSpec プロジェクト
`tsp/` ディレクトリを作成し、`main.tsp`, `users.tsp`, `filters.tsp`, `tspconfig.yaml` を配置します。
```typescript
// tsp/main.tsp
import "@typespec/http";
import "@typespec/openapi";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.OpenAPI;

@service({ title: "Sample User API" })
@info({ version: "1.0.0" })
@route("/api")
namespace SampleApi;

import "./users.tsp";
import "./filters.tsp";
```

```typescript
// tsp/users.tsp
import "@typespec/http";

using TypeSpec.Http;

namespace SampleApi.Users;

model User {
  id: string;
  name: string;
  email: string;
}

@route("/users")
@get
op listUsers(@query q?: string): {
  @statusCode status: 200;
  @body users: User[];
};
```

```typescript
// tsp/filters.tsp
import "@typespec/http";

using TypeSpec.Http;

namespace SampleApi.Filters;

model FilterOption {
  value: string;
  label: string;
}

@route("/filters/skills")
@get
op listSkillOptions(): {
  @statusCode status: 200;
  @body items: FilterOption[];
};

@route("/filters/departments")
@get
op listDepartmentOptions(): {
  @statusCode status: 200;
  @body items: FilterOption[];
};
```

```yaml
# tsp/tspconfig.yaml
emitters:
  @typespec/openapi3: {}
```

### 4-2. Orval 設定
ルート直下に `orval.config.ts` を作成します。
```typescript
import { defineConfig } from "orval";

export default defineConfig({
  users: {
    input: { target: "./openapi/openapi.json" },
    output: {
      target: "./src/api-client/generated.ts",
      client: "axios",
      override: {
        mutator: {
          path: "./src/api-client/axios-instance.ts",
          name: "axiosInstance",
        },
      },
    },
  },
});
```

`openapi/` ディレクトリは `npm run gen` 実行時に自動生成されます。

## 5. MSW・React Query・MUI の土台
### 5-1. アプリケーションプロバイダ
`src/app/app-providers.tsx` を作成し、MUI / TanStack Query / MSW を束ねます。
```tsx
"use client";

import { ReactNode, useEffect } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import Providers from "./providers";
import { ENV } from "@/config/env";
import theme from "@/theme/theme";

const MSW_START_FLAG = "__app_msw_worker_started";

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    if (!ENV.mswEnabled || ENV.appEnv !== "local" || typeof window === "undefined" || process.env.NODE_ENV === "production") {
      return;
    }

    const globalScope = window as typeof window & { [MSW_START_FLAG]?: boolean };
    if (globalScope[MSW_START_FLAG]) {
      return;
    }

    void import("@/mocks/msw/browser")
      .then(({ worker }) => worker.start({ onUnhandledRequest: "bypass" }))
      .then(() => {
        globalScope[MSW_START_FLAG] = true;
      })
      .catch(() => {
        // Service Worker が使えない環境では握り潰す
      });
  }, []);

  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Providers>{children}</Providers>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
```

### 5-2. その他の土台
- `src/app/providers.tsx` に React Query の `QueryClientProvider` や LRU キャッシュを定義
- `src/config/env.ts` で環境変数を型安全に読み出し
- `src/theme/theme.ts` で MUI テーマを定義
- `src/api-client/axios-instance.ts` で Orval が利用する axios インスタンスを定義
- `src/mocks/msw` 配下に `browser.ts`, `node.ts`, `server.ts`, `handlers.ts`, `data/*` を配置

> これらのファイルは本リポジトリの実装を参考に再現してください。コンポーネントは Atomic Design に従い、`src/components/{atoms,molecules,organisms,templates}` に配置します。

## 6. テスト設定
- `tests/setup.ts` を作成し、`@testing-library/jest-dom` の読み込みと `next/navigation` のモック、`cleanup` を定義
- 統合テストは `tests/integration/`、ユニットテストは `tests/unit/` に配置
- `package.json` の `test:unit` / `test:integration` スクリプトで実行

## 7. 環境ファイルの準備
各環境向けに `.env.local`, `.env.development`, `.env.staging`, `.env.production` を `.env.example` からコピーし、`NEXT_PUBLIC_API_BASE_URL` や `NEXT_PUBLIC_SITE_URL`, `SERVER_CACHE_TTL_MS` などを実際の値に置き換えます。

## 8. 生成と検証
```bash
# API スキーマ → クライアント生成
npm run gen

# テスト
npm run test:unit
npm run test:integration

# 開発サーバー
npm run dev
```
- 初回アクセス時、ブラウザのコンソールで MSW が起動したことを確認してください（`[MSW] Mocking enabled`）。
- API 実装と UI は `src/services` / `src/components` を基準に追加します。

## 9. 運用上の注意
- `package.json`, `next.config.mjs`, `.gitlab-ci.yml` などのクリティカルファイルは変更時にレビュー必須
- シークレットや `.env*` の値は共有・プロンプト入力しない
- 作業ログ・ドキュメントは日本語、内部思考は非公開

---
セットアップが完了すると、`npm run dev` でローカル開発、`npm run build` → `npm run start` で本番相当の挙動を確認できます。
