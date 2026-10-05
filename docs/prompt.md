以下の対応を、既存コードを確認したうえで実装してください。

## 背景

フロントエンドで `keycloak-js` を使用してOIDC認証を行っています。

技術スタックは主に以下です。

- Next.js 16
- App Router
- TypeScript
- `keycloak-js` 26系（実際のインストールバージョンは package.json / lock file を確認すること）
- OIDC Authorization Code Flow
- PKCE S256

現在、社内検証環境のみHTTPSではなくHTTPです。

例：

```text
本番:
https://xxxx
→ 正常

社内検証:
http://xxxx.internal
→ keycloak-js初期化・ログイン処理でエラー
```

私は社内検証環境のインフラを変更する権限を持っていないため、

- HTTPS化
- リバースプロキシ変更
- DNS変更
- ブラウザ起動オプション変更

などは今回の解決策として使用できません。

**フロントエンドのコード変更だけで対応してください。**

---

## 現在発生している問題

最近の `keycloak-js` はブラウザ標準のWeb Crypto APIを利用するようになっています。

Secure Contextでは、

```ts
crypto.randomUUID()
crypto.subtle.digest()
```

などが利用できますが、通常のHTTPサイトはSecure Contextではないため利用できません。

一方、

```ts
crypto.getRandomValues()
```

は通常のHTTP環境でも利用できます。

現在確認している代表的なエラーは、

```text
crypto.randomUUID is not a function
```

です。

ただし `randomUUID()` だけを直しても、PKCE S256処理で

```ts
crypto.subtle.digest('SHA-256', ...)
```

が必要になるため、そこも考慮する必要があります。

---

## Keycloak本体の実装について

Keycloak Server自身もHTTP / insecure contextとの互換性のため、

```text
web-crypto-shim.js
```

を持っています。

Keycloak 26系の実装では概ね、

- `crypto.subtle.digest()`
- `crypto.getRandomValues()`
- `crypto.randomUUID()`

にfallbackを提供しています。

SHA-256等には `@noble/hashes` が使われています。

ただしKeycloak本体のshimには、`crypto.getRandomValues()` が存在しない場合に `Math.random()` を使うfallbackが存在するバージョンがあります。

**今回のアプリでは、この `Math.random()` fallbackは使用しないでください。**

認証のstate / nonce / PKCE verifier等に利用する乱数なので、暗号学的に安全なブラウザ標準の

```ts
crypto.getRandomValues()
```

が利用できない場合はエラーにしてください。

---

# 実装方針

基本方針は、

**HTTP環境で不足しているWeb Crypto APIだけをshimし、PKCE S256はそのまま維持する**

です。

以下のような構成を想定しています。

```text
keycloak-js
    |
    +-- crypto.randomUUID()
    |       |
    |       +-- shim
    |             |
    |             +-- crypto.getRandomValues()
    |                 （ブラウザ純正）
    |
    +-- crypto.getRandomValues()
    |       |
    |       +-- ブラウザ純正
    |
    +-- crypto.subtle.digest("SHA-256")
            |
            +-- shim
                  |
                  +-- @noble/hashes
```

---

## 必須要件

### 1. PKCEを無効化しない

以下のような対応は禁止です。

```ts
pkceMethod: false
```

PKCEは引き続き

```ts
pkceMethod: 'S256'
```

を使用してください。

既存コードで明示されていなくても、keycloak-js側のデフォルトや現在の設定を確認してください。

---

### 2. randomUUIDを安全にfallbackする

`crypto.randomUUID` が存在しない場合のみshimしてください。

UUID v4生成には必ずブラウザ標準の

```ts
crypto.getRandomValues()
```

を使用してください。

概念的には以下です。

```ts
const bytes = crypto.getRandomValues(new Uint8Array(16))

bytes[6] = (bytes[6] & 0x0f) | 0x40
bytes[8] = (bytes[8] & 0x3f) | 0x80
```

これをRFC 4122 / UUID v4形式の文字列にしてください。

---

### 3. SHA-256をfallbackする

HTTP環境では `crypto.subtle` が利用できないことがあるため、

```ts
crypto.subtle.digest('SHA-256', data)
```

相当を提供してください。

候補として、

```text
@noble/hashes
```

を使用してください。

ただし、実装時点の最新版と既存依存関係を確認し、現在のAPI/import方法を確認してから実装してください。

例えばバージョンによって、

```ts
import { sha256 } from '@noble/hashes/sha2.js'
```

等になる可能性があります。

推測でimportを書かず、実際にインストールするバージョンのAPIを確認してください。

今回はKeycloak.jsが必要とする用途が目的なので、最低限 `SHA-256` をサポートすれば構いません。

---

### 4. getRandomValuesを弱い乱数でfallbackしない

以下は禁止です。

```ts
Math.random()
```

`crypto.getRandomValues` が存在しない場合は、

```ts
throw new Error(...)
```

としてください。

---

### 5. Secure Contextではブラウザ標準実装を使用する

HTTPS環境で、

```ts
crypto.randomUUID
crypto.subtle
crypto.getRandomValues
```

が存在している場合は、それらを上書きしないでください。

つまり、

```text
本番HTTPS
→ ブラウザ標準Web Crypto

社内HTTP
→ 不足している部分だけshim
```

という動作にしてください。

---

### 6. Keycloakより前にshimを適用する

`keycloak-js` が実際に対象APIを呼び出す前にshimがインストールされている必要があります。

既存プロジェクトのKeycloak初期化コードを調査し、

```text
install shim
↓
Keycloak生成
↓
keycloak.init()
```

になるようにしてください。

Next.js App Routerなので、SSR時に `window` / `crypto` を誤って参照しないように注意してください。

必要なら、

```ts
if (typeof window === 'undefined') {
  return
}
```

などでClient側だけ実行してください。

ただし既存のClient Component構成を確認して、最も自然な場所に配置してください。

---

## 重要：まず既存コードを調査すること

実装を始める前に以下を確認してください。

1. `package.json`
2. lock file
3. `keycloak-js` の実際のバージョン
4. Keycloakインスタンスを生成している場所
5. `keycloak.init()` の場所
6. `pkceMethod` の現在の設定
7. `onLoad` 等のKeycloak設定
8. SSR / Client Component境界
9. Keycloak初期化処理が複数回実行される可能性
10. 既存テスト構成

既存設計を極力壊さず、最小限の変更にしてください。

---

## 実装イメージ

例えば以下のようなモジュールを作ることを想定しています。

```text
keycloak-web-crypto-shim.ts
```

概念的には、

```ts
export function installKeycloakWebCryptoShim(): void {
  if (typeof window === 'undefined') {
    return
  }

  if (typeof crypto === 'undefined') {
    throw new Error('Crypto API is not available.')
  }

  if (typeof crypto.getRandomValues === 'undefined') {
    throw new Error('crypto.getRandomValues() is not available.')
  }

  if (typeof crypto.subtle === 'undefined') {
    // @noble/hashes を使ってSHA-256 digest互換処理を提供
  }

  if (typeof crypto.randomUUID === 'undefined') {
    // crypto.getRandomValues() を利用してUUID v4を生成
  }
}
```

ただし、これはあくまで設計イメージです。

**現在のTypeScript DOM型定義や `Crypto` / `SubtleCrypto` のreadonly性などを確認し、型安全かつ不自然なキャストを極力減らした実装にしてください。**

また、

```ts
Object.defineProperty(...)
```

を使うのが適切かどうかも実際のブラウザ挙動を踏まえて判断してください。

---

# 特に確認してほしいこと

現在インストールされている `keycloak-js` のソースコードも確認して、

**実際にWeb Crypto APIをどこで使っているかを確認してください。**

少なくとも、

```text
crypto.randomUUID()
crypto.getRandomValues()
crypto.subtle.digest()
```

について調査してください。

他にもSecure Context限定APIを利用している場合は、それも報告してください。

つまり、

「randomUUIDとSHA-256をshimすれば、おそらく動く」

ではなく、

**現在使用しているkeycloak-jsのバージョンでは、このshimで必要なAPIをすべてカバーできている**

ことを確認してください。

---

# セキュリティ要件

今回HTTPなのは社内検証環境の制約によるものです。

HTTPそのもののMITMリスク等は承知しています。

そのうえで、アプリ側で追加のセキュリティ低下を起こさないことを重視します。

そのため、

- PKCE S256維持
- `Math.random()` 禁止
- `crypto.getRandomValues()` 使用
- HTTPSでは標準Web Cryptoをそのまま使用
- 不必要な認証設定変更を行わない

を守ってください。

---

# 依存ライブラリ

SHA-256 fallbackには、Keycloak本体でも採用実績のある

```text
@noble/hashes
```

を第一候補にしてください。

ただし新規依存を追加する前に、

- 既存依存に利用可能なものがないか
- バージョン
- package size
- browser対応
- license

を確認してください。

不要なcryptoライブラリを大量に追加しないでください。

---

# ライセンス

Keycloak本体のshimをそのままコピーするのではなく、考え方・実装を参考にして、このアプリに必要な最小限のコードとして実装してください。

KeycloakはApache License 2.0、`@noble/hashes` はMIT系ライセンスなので、必要なライセンス上の対応がある場合は報告してください。

---

# テスト

可能な範囲でテストも追加してください。

最低でも次のケースを考慮してください。

### HTTPS / Secure Context相当

既存の、

```ts
crypto.randomUUID
crypto.subtle
crypto.getRandomValues
```

が存在する場合、

**何も上書きしないこと。**

### HTTP / insecure context相当

```ts
crypto.randomUUID === undefined
crypto.subtle === undefined
crypto.getRandomValues !== undefined
```

の場合、

- randomUUIDが利用可能になる
- UUID v4として正しい形式になる
- SHA-256 digestが利用可能になる
- 同じ入力に対して標準SHA-256と同じ結果になる
- PKCE S256処理が成立する

ことを確認してください。

### getRandomValues無し

```ts
crypto.getRandomValues === undefined
```

なら、安全でないfallbackを行わずエラーにしてください。

---

# 完了条件

最終的に、

```text
HTTPS本番
→ 従来通りブラウザ標準Web Crypto
→ PKCE S256
→ 正常

HTTP社内検証環境
→ Web Crypto shim
→ PKCE S256
→ Keycloakログイン可能
```

になることがゴールです。

---

# 実装後に報告してほしい内容

作業後、以下を簡潔に説明してください。

1. 原因
2. keycloak-jsが利用していたWeb Crypto API
3. 変更したファイル
4. 追加した依存
5. shimの仕組み
6. HTTPS環境への影響がない理由
7. PKCE S256を維持できていること
8. セキュリティ上の考慮事項
9. 実行したテスト
10. 残っている懸念点

単にコードを書くだけでなく、実際に型チェック・Lint・既存テスト等、プロジェクトで利用可能な検証を実行して結果を確認してください。

既存コードをまず調査し、必要以上のリファクタリングは行わず、この問題を解決するための最小限かつ保守しやすい変更にしてください。