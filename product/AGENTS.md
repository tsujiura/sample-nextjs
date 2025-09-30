# AGENTS.md（プロジェクト運用ガイド）

## 目的
Next.js（App Router）と MUI を用いた「検索→一覧」体験を反復的に追加するため、gpt-5-codex が安全かつ再現性高く作業できるルールとセットアップ手順を定義する。

## 前提環境
- Node.js 20 LTS 以上（`node --version` で確認）
- npm 10 以上（このプロジェクトは npm を想定）
- TypeSpec/Orval は `npm install` 後に `node_modules/.bin` から利用されるため追加インストール不要
- Git と MSW が利用できるブラウザ（Service Worker 対応）が開発環境にあること

## 主要ディレクトリ
- `src/app` : App Router エントリとレイアウト。`app-providers.tsx` が MUI・React Query・MSW を束ねる
- `src/components` : Atomic Design を意識した再利用コンポーネント
- `src/mocks/msw` : 開発・テストで利用するハンドラ（`browser.ts` / `node.ts`）とモックデータ
- `src/api-client` : Orval が生成する API クライアントと `axios-instance.ts`
- `src/services` : ビジネスロジック層（React Query のカスタムフックなど）
- `tsp/` : TypeSpec 定義（`main.tsp`）と `tspconfig.yaml`
- `openapi/` : TypeSpec から生成される `openapi.json`
- `tests/` : Vitest によるユニット・統合テスト (`tests/integration` は RTL+MSW)
- `.env.example` : 各環境ファイルの雛形

## 初期セットアップ
1. 依存関係をインストール: `npm install`
2. 環境変数ファイルを作成: `.env.example` を各環境にコピー（例: `cp .env.example .env.local`）し、 `NEXT_PUBLIC_API_BASE_URL` や `NEXT_PUBLIC_SITE_URL` などを実際の値に更新
3. API クライアントを生成: `npm run gen` （TypeSpec → OpenAPI → Orval）
4. 開発サーバーを起動: `npm run dev`（`APP_ENV=local` かつ `NEXT_PUBLIC_API_MOCK=true` で MSW が自動起動）

## 環境設定
- `APP_ENV`（local / development / staging / production）に応じて `.env.<APP_ENV>` が `next.config.mjs` で読み込まれる
- `NEXT_PUBLIC_API_MOCK=true` かつ `APP_ENV=local` のとき、ブラウザで MSW Service Worker を起動
- `SERVER_CACHE_TTL_MS` でサーバーサイドキャッシュ（`lru-cache`）の TTL を制御

## 開発ワークフロー（推奨 TDD）
1. 画面 or エンドポイントの受け入れ条件を洗い出す（フォーム → 検索 → 一覧 → URL 復元）
2. React Testing Library + MSW を用いた統合テストで「失敗するテスト」を用意
3. MUI + Axios + React Query + MSW を最小実装 → テスト緑化 → リファクタリング
4. 1 PR = 1 画面 or 1 エンドポイントを基本とし、生成コマンド（`npm run gen`）はコミットに含める

## よく使うコマンド
- `npm run dev` / `npm run dev:stg` : ローカル／ステージング設定で開発サーバーを起動
- `npm run build` → `npm run start` : 本番ビルドと起動
- `npm run lint` : ESLint チェック
- `npm run test:unit` / `npm run test:integration` : Vitest によるユニット／統合テスト
- `npm run gen` : API スキーマとクライアント生成（TypeSpec → OpenAPI → Orval）

## テスト・モックポリシー
- 開発時は MSW（`src/mocks/msw`）で HTTP レイヤーを再現
- サーバーサイドでは `node.ts`、ブラウザでは `browser.ts` を利用
- テストは Vitest + RTL を使用し、モックデータは `src/mocks/msw/data` を共有

## ガードレール
- クリティカルファイル（`package.json`, `next.config.mjs`, `.gitlab-ci.yml` など）はパッチ提案→人間承認→適用
- 機密情報（`.env*`, CI シークレット）はプロンプトに貼り付けない

## Language Policy
- 入力（ユーザーからの指示）：**日本語**
- 内部思考（計画・推論・分解）：**英語**（外部には出力しない）
- 出力（最終回答・パッチ・コマンド・説明）：**日本語**

## 運用ルール
- すべてのタスクプロンプトは本 Language Policy を **System 指示として継承** する
- チェーン・オブ・ソート（思考過程）は表示しない。必要に応じて手順・根拠は **日本語の要約** で提示
- 例外：エラーメッセージ等は原文（英語）可。ただし **日本語の要約** を併記
