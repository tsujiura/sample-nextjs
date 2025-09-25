# AGENTS.md（最小）

## 目的
Next.js + MUI の「検索→一覧」ページを継続追加するため、
gpt-5-codex を安全・再現的に使う最小ルールを定義する。

## スコープ
- 取得: TypeSpec→OpenAPI→Orval（axios, mutator=axiosInstance）
- キャッシュ: Client=TanStack Query, Server=lru-cache
- モック: MSW（開発/テスト）
- テスト: Unit=Vitest, Integration=RTL+MSW
- 環境: local/development/staging/production（.env.*, APP_ENV）
- ディレクトリ: ルート=product/, App Router, Atomic Design

## ワークフロー（TDD）
1) 受け入れ条件を列挙（フォーム→検索→表→URL復元）
2) Integrationで「落ちるテスト」を作る
3) 最小実装（MUI+axios+Query+MSW）→Green→リファクタ
4) 1PR=1画面 or 1エンドポイント

## 生成・実行
- `npm run gen`（tsp→openapi.json→orval）
- `npm run test:integration` / `npm run test:unit`
- dev時は `NEXT_PUBLIC_API_MOCK=true` で MSW 自動起動

## ガードレール
- クリティカル（package.json, next.config.mjs, .gitlab-ci.yml）は
  「パッチ提案→人間承認→適用」
- 機密はプロンプトに貼らない（.env / CIシークレット）

## Language Policy
- 入力（ユーザーからの指示）：**日本語**
- 内部思考（計画・推論・分解）：**英語**（外部に出さない）
- 出力（最終回答・パッチ・コマンド・説明）：**日本語**

## 運用ルール
- すべてのタスクプロンプトは、この Language Policy を **System 相当の指示として継承**すること。
- チェーン・オブ・ソート（思考過程）は表示しない。必要に応じて手順・根拠は**日本語の要約**で提示。
- 例外：エラーメッセージ・スタックトレース・外部ツールのログは原文（英語）可。ただし**日本語で要約**を併記。
