# ガイドシステム API

## 概要

THEME-001「スマートキーでドアが開かない」のガイドシステムで使用するAPIの実装です。

---

## API一覧

### 1. 近隣店舗検索API (`/api/nearby-stores`)

**使用ガイド**: GUIDE-004（電池購入方法）

**機能**: ユーザーの位置情報から、CR2450電池を購入できる近隣店舗を検索します。

### 2. 販売店検索API (`/api/dealers/search`)

**使用ガイド**: GUIDE-006, GUIDE-012（販売店予約・連絡先）

**機能**: トヨタ販売店を検索し、サービス内容・営業時間を提供します。

### 3. 販売店予約API (`/api/dealers/reserve`)

**使用ガイド**: GUIDE-006（販売店予約）

**機能**: 販売店での電池交換サービスを予約します。

---

## ディレクトリ構造

```
api/
├── README.md                    # API概要（本ファイル）
├── requirements.txt             # Python依存パッケージ
├── config.py                    # 設定ファイル
├── app.py                       # Flaskアプリケーション
│
├── models/                      # データモデル
│   ├── __init__.py
│   ├── store.py                 # 店舗モデル
│   └── dealer.py                # 販売店モデル
│
├── services/                    # ビジネスロジック
│   ├── __init__.py
│   ├── nearby_stores.py         # 近隣店舗検索
│   └── dealer_service.py        # 販売店サービス
│
├── routes/                      # APIルート
│   ├── __init__.py
│   ├── stores.py                # 店舗API
│   └── dealers.py               # 販売店API
│
├── data/                        # マスターデータ
│   ├── dealers.json             # 販売店データ
│   └── store_types.json         # 店舗タイプ定義
│
└── tests/                       # テスト
    ├── test_stores.py
    └── test_dealers.py
```

---

## 技術スタック

- **フレームワーク**: Flask 3.0+
- **データベース**: SQLite（開発用）/ PostgreSQL（本番用）
- **外部API**: Google Places API
- **認証**: JWT（将来実装）
- **CORS**: Flask-CORS

---

## セットアップ

### 1. 仮想環境作成

```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
```

### 2. 依存パッケージインストール

```bash
pip install -r requirements.txt
```

### 3. 環境変数設定

`.env`ファイルを作成:

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
GOOGLE_PLACES_API_KEY=your-google-api-key
DATABASE_URL=sqlite:///guide_system.db
```

### 4. データベース初期化

```bash
flask db init
flask db migrate
flask db upgrade
```

### 5. サーバー起動

```bash
flask run
```

サーバーが起動します: `http://localhost:5000`

---

## API仕様

詳細は各APIのドキュメントを参照してください:

- [近隣店舗検索API仕様](docs/API_NEARBY_STORES.md)
- [販売店検索API仕様](docs/API_DEALER_SEARCH.md)
- [販売店予約API仕様](docs/API_DEALER_RESERVE.md)

---

## 次のステップ

1. [ ] Google Places API キー取得
2. [ ] 販売店マスターデータ作成
3. [ ] APIのテスト実施
4. [ ] フロントエンドとの統合
