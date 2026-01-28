# Vercelデプロイガイド

このプロジェクトをVercelにデプロイする手順です。

## 前提条件

- Vercelアカウント（[vercel.com](https://vercel.com)で無料登録可能）
- Gitリポジトリ（GitHub、GitLab、Bitbucketなど）

## デプロイ方法

### 方法1: Vercel CLIを使用（推奨）

1. **Vercel CLIをインストール**
   ```bash
   npm install -g vercel
   ```

2. **Vercelにログイン**
   ```bash
   vercel login
   ```

3. **プロジェクトルートでデプロイ**
   ```bash
   cd "c:\Users\a01380\OneDrive - CMC Corporation\デスクトップ\DOI_2512"
   vercel
   ```

4. **本番環境にデプロイ**
   ```bash
   vercel --prod
   ```

### 方法2: GitHub連携（推奨）

1. **GitHubにリポジトリを作成**
   - GitHubで新しいリポジトリを作成
   - このプロジェクトをプッシュ

2. **Vercelでプロジェクトをインポート**
   - [Vercel Dashboard](https://vercel.com/dashboard)にアクセス
   - "Add New..." → "Project" をクリック
   - GitHubリポジトリを選択
   - プロジェクト設定：
     - **Framework Preset**: Other
     - **Root Directory**: `./` (そのまま)
     - **Build Command**: (空欄)
     - **Output Directory**: `public`
   - "Deploy" をクリック

3. **自動デプロイ**
   - 以降、`main`ブランチにプッシュすると自動でデプロイされます

## プロジェクト構造

```
DOI_2512/
├── public/
│   └── index.html          # メインのHTMLファイル
├── vercel.json            # Vercel設定ファイル
├── .vercelignore          # デプロイ除外ファイル
└── package.json           # プロジェクト情報
```

## カスタムドメイン設定

1. Vercel Dashboardでプロジェクトを開く
2. "Settings" → "Domains" を選択
3. ドメイン名を入力して追加
4. DNS設定を指示に従って更新

## 環境変数（必要に応じて）

API連携などで環境変数が必要な場合：

1. Vercel Dashboardでプロジェクトを開く
2. "Settings" → "Environment Variables" を選択
3. 変数を追加

## トラブルシューティング

### デプロイが失敗する場合

- `vercel.json`の設定を確認
- `public/index.html`が存在するか確認
- Vercelのビルドログを確認

### 404エラーが表示される場合

- `vercel.json`の`rewrites`設定を確認
- `public/index.html`が正しく配置されているか確認

## 参考リンク

- [Vercel公式ドキュメント](https://vercel.com/docs)
- [Vercel CLIリファレンス](https://vercel.com/docs/cli)
