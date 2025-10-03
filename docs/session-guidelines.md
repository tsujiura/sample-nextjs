# セッションメモ（開発時の要点）

このドキュメントは、過去セッションで確認・決定した内容を再利用できるようにまとめたメモです。新しいセッションで参照することで、同じ質問や検証を繰り返す手間を減らします。

## 環境変数と設定
- `.env.example` をコピーして各環境ファイル（`.env.local`, `.env.staging` など）を作成し、`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `SERVER_CACHE_TTL_MS` などを実値へ更新する。
- `.env.<APP_ENV>` が `next.config.mjs` から読み込まれた後、フォールバックとして `.env` が読み込まれる。未設定の値のみ `.env` 側が補完する。
- `NEXT_PUBLIC_` プレフィックス付きの変数のみブラウザ側へ公開される。公開不要な値は接頭辞なしで定義し、サーバー側のみで参照。
- `src/config/env/index.ts` は環境名ごとの基準値（`src/config/env/local.ts` など）を読み込み、環境変数で上書きして `ENV` を提供する。

## API スキーマと Orval
- TypeSpec を `tsp/main.tsp`（サービス定義）、`tsp/sample.tsp`（サンプル API）、`tsp/filters.tsp`（フィルター API）に分割。エンドポイントは `/api/fizz`, `/api/filters/tokens`, `/api/filters/sections`。
- スキーマや TypeSpec を変更したら **必ず `npm run gen`** を実行し、`openapi/openapi.json` と `src/api-client/generated.ts` を再生成する。
- 生成された `src/api-client/generated.ts` をアプリ内で利用済み。検索ページは `getSampleItemAPI()` から `itemsListSampleItems` を呼び、フィルター候補の取得も同クライアント経由で行う。
- `src/api-client/axios-instance.ts` では `paramsSerializer.indexes = null` を設定しており、配列クエリは `?tokens=value` の形式で送信される。
- `app/api` 配下は Next.js Route Handler の置き場。外部 API へのプロキシ、MSW 起動、ヘッダー引き継ぎなどアプリ固有の処理を担うため、削除しない。
- `app/api/_utils` のようにアンダースコア付きディレクトリを使うことで、App Router のルートとして公開されない「内部用」モジュールであることを示す。

## フロントエンド実装の補足
- フォントは `src/theme/theme.ts` で `Arial, メイリオ, Meiryo, Hiragino Kaku Gothic ProN, ヒラギノ角ゴ ProN W3, sans-serif` の順で指定済み。
- Atomic Design はチーム体制（デザイナー不在・Storybook不使用）と MUI の標準コンポーネント活用方針を踏まえ、厳密には採用しない方針。必要な共通化が生じたタイミングでピンポイントにコンポーネント化する。
- 画面専用の UI は `SamplePageClient.tsx` のようにページファイル内へ集約し、複数画面で共有したい要素だけ `src/components/` 配下へ切り出す。

## ツール・ワークフロー
- 生成ファイル（`src/api-client/generated.ts`）を直接編集しない。仕様変更時は TypeSpec → `npm run gen` の流れで再生成する。
- `app/sample/search/page.tsx` などサーバー側で Orval クライアントを使う際は MSW を起動してから実行する（`startMockServer()`）。
- `SamplePageClient` では生成クライアントの型に合わせ、ソート値を `ItemsListSampleItemsSort` に変換してから API へ渡す。

## DevTools とコンテナの制約
- このコンテナ環境には GUI がないため、Chrome DevTools や実際のブラウザ表示確認はできない。レイアウト確認はホスト端末で `npm run dev` → ブラウザアクセス。
- `mcp.json` は MCP 対応クライアントが参照する設定ファイル。コンテナ単体に置いても自動で DevTools は起動しない。ホスト側で MCP 対応クライアントまたは `npx chrome-devtools-mcp@latest` を実行する。
- 表示調整や崩れの修正が必要な場合は、ホストで確認した結果（スクリーンショットなど）を共有し、コード側で対応する。

## 履歴管理
- 重要な運用ルールや環境構築手順は `docs/` や `product/AGENTS.md` にまとめ、コンテナ再構築後も参照できるようにする。
- このメモは今後のセッションでも参照可能なように `docs/` 直下へ配置。
