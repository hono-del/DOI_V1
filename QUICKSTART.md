# クイックスタートガイド

## 🚀 5分で始める

THEME-001「スマートキーでドアが開かない」の完全なシステムを起動します。

---

## ステップ1: フロントエンドを試す（1分）

### すぐに見れるデモ版

```bash
# ガイド統合チャットシステムを開く
start frontend/guide-chat-integrated.html
```

または、ファイルをダブルクリック:
```
frontend/guide-chat-integrated.html
```

### 試してみること

1. **スタート**: 「🔑 スマートキーでドアが開かない」をクリック
2. **診断**: インジケーター確認の質問に答える
3. **選択**: 「自分で交換する」または「販売店に依頼する」を選択
4. **ガイド**: 青い「📖 ガイド」リンクをクリックして詳細確認

---

## ステップ2: APIサーバーを起動（3分）

### 環境構築

```bash
# apiディレクトリに移動
cd api

# 仮想環境作成
python -m venv venv

# 仮想環境有効化（Windows）
venv\Scripts\activate

# 依存パッケージインストール
pip install -r requirements.txt
```

### データベース初期化

```bash
# サンプルデータを含むDBを作成
python init_db.py
```

**出力例**:
```
Creating tables...
✅ Tables created

Clearing existing data...
Loading store data...
✅ Loaded 4 stores
Loading dealer data...
✅ Loaded 3 dealers

✅ Database initialized successfully!
```

### サーバー起動

```bash
# Flaskサーバー起動
python app.py
```

**起動メッセージ**:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

サーバーが起動したら、ブラウザで確認:
```
http://localhost:5000
```

**表示される内容**:
```json
{
  "message": "Guide System API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## ステップ3: システム全体を確認（1分）

### API動作テスト

新しいターミナルを開いて:

```bash
# 近隣店舗検索
curl -X POST http://localhost:5000/api/nearby-stores -H "Content-Type: application/json" -d "{\"location\":{\"latitude\":35.6812,\"longitude\":139.7671},\"item\":\"CR2450\",\"radius_km\":5}"
```

**レスポンス確認**: 店舗4件が返ってくればOK

---

### フロントエンドからAPI連携

1. `frontend/guide-chat-integrated.html` を開く
2. 「スマートキーでドアが開かない」をクリック
3. 「いいえ、点灯しません」→「自分で交換する」→「電池が必要です」
4. 近隣店舗が表示されることを確認

---

## 📁 ファイル構成

```
DOI_2512/
│
├── 📊 データ層
│   └── docs/journey/csv_data/
│       ├── guide_content/          # 13個のガイドJSON
│       ├── Guide.csv               # ガイド一覧
│       ├── JourneyNode.csv         # ノード定義
│       └── ...
│
├── 🌐 API層
│   └── api/
│       ├── app.py                  # Flaskアプリ
│       ├── models/                 # データモデル
│       ├── services/               # ビジネスロジック
│       └── routes/                 # APIエンドポイント
│
├── 💻 フロントエンド層
│   └── frontend/
│       ├── chat-system.html        # スタンドアロン版
│       └── guide-chat-integrated.html  # ガイド統合版
│
└── 📖 ドキュメント
    ├── QUICKSTART.md               # 本ファイル
    └── SYSTEM_INTEGRATION_COMPLETE.md
```

---

## 🎯 使用シナリオ

### シナリオ1: 夜間の緊急対応

**状況**: 23時、自宅駐車場、スマートキーが反応しない

**操作**:
1. チャットを開く
2. 「スマートキーでドアが開かない」
3. 「いいえ、点灯しません」（電池切れ）
4. **GUIDE-001（機械キー）**で今すぐドアを開ける ✅
5. 翌日の電池交換を案内

**結果**: 1分で解決（夜間でも対応可能）

---

### シナリオ2: 平日昼間のDIY

**状況**: 14時、オフィス、電池交換を自分でやりたい

**操作**:
1. チャットを開く
2. 「電池交換の方法」
3. 「自分で交換する」
4. 「電池が必要です」
5. **近隣店舗APIで検索** → 3件表示
6. 店舗で購入（所要15分）
7. **GUIDE-005（交換手順）**を見ながら交換
8. 完了・動作確認

**結果**: 20分で解決（購入含む）

---

### シナリオ3: 販売店予約

**状況**: 土曜午前、DIYが不安、専門家に依頼したい

**操作**:
1. チャットを開く
2. 「スマートキーでドアが開かない」
3. 「いいえ、点灯しません」
4. 「販売店に依頼する」
5. **販売店APIで検索** → 近隣3店舗表示
6. 「トヨタ東京カローラ 新宿店」を選択
7. 予約フォーム入力（日時、名前、電話）
8. 予約確定 → 予約番号発行

**結果**: 3分で予約完了

---

## 🐛 トラブルシューティング

### チャットが表示されない

**原因**: ファイルパスの問題

**解決**:
```bash
# 正しいパスで開く
cd frontend
start guide-chat-integrated.html
```

---

### APIに接続できない

**原因**: サーバーが起動していない

**解決**:
```bash
cd api
python app.py

# 別のターミナルで確認
curl http://localhost:5000/health
```

---

### ガイドが読み込めない

**原因**: JSONファイルのパスが間違っている

**解決**:
```javascript
// guide-chat-integrated.html の GUIDE_CONTENT_PATH を確認
const GUIDE_CONTENT_PATH = '../docs/journey/csv_data/guide_content/';
```

---

## 📚 参考ドキュメント

### 使い方

- **QUICKSTART.md** - 本ファイル（クイックスタート）
- **frontend/INTEGRATION_GUIDE.md** - フロントエンド統合
- **api/API_SETUP_GUIDE.md** - API セットアップ

### 技術詳細

- **SYSTEM_INTEGRATION_COMPLETE.md** - システム統合レポート
- **docs/journey/csv_data/COMPLETE_GUIDE_SYSTEM.md** - ガイドシステム
- **api/API_IMPLEMENTATION_SUMMARY.md** - API実装サマリー

---

## ✅ チェックリスト

### 動作確認

- [ ] フロントエンド: `guide-chat-integrated.html`を開く
- [ ] API: `python app.py`でサーバー起動
- [ ] 統合: チャットから店舗検索を実行

### 機能確認

- [ ] スマートキーフロー（インジケーター確認）
- [ ] 電池切れ診断
- [ ] 機械キー案内（GUIDE-001）
- [ ] 電池交換手順（GUIDE-005）
- [ ] 近隣店舗検索（API連携またはデモ）
- [ ] 販売店予約フォーム

---

## 🎉 完成!

**すべての準備が整いました!**

さっそく`frontend/guide-chat-integrated.html`を開いて、インタラクティブなガイド体験を試してみてください。

**「🔑 スマートキーでドアが開かない」をクリックしてフローを開始!** 🚀
