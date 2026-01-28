# API セットアップガイド

## 🚀 クイックスタート

### 1. 環境構築

```bash
# プロジェクトディレクトリに移動
cd api

# 仮想環境作成
python -m venv venv

# 仮想環境有効化
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 依存パッケージインストール
pip install -r requirements.txt
```

---

### 2. 環境変数設定

`.env`ファイルを作成:

```bash
# .env.exampleをコピー
copy .env.example .env  # Windows
cp .env.example .env     # Mac/Linux
```

`.env`ファイルを編集:

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
GOOGLE_PLACES_API_KEY=your-api-key  # ← Google API Keyを設定
DATABASE_URL=sqlite:///guide_system.db
```

---

### 3. データベース初期化

```bash
# データベースとサンプルデータを作成
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

---

### 4. サーバー起動

```bash
# 開発サーバー起動
python app.py
```

**起動メッセージ**:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

サーバーが起動したら、ブラウザで `http://localhost:5000` にアクセス

---

## 📊 API動作確認

### ヘルスチェック

```bash
curl http://localhost:5000/health
```

**レスポンス**:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

---

### 近隣店舗検索API

```bash
curl -X POST http://localhost:5000/api/nearby-stores \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "latitude": 35.6812,
      "longitude": 139.7671
    },
    "item": "CR2450",
    "radius_km": 5
  }'
```

**レスポンス例**:
```json
{
  "stores": [
    {
      "name": "ヨドバシカメラ 新宿西口本店",
      "store_type": "家電量販店",
      "location": {
        "latitude": 35.6917,
        "longitude": 139.6990,
        "address": "東京都新宿区西新宿1-11-1"
      },
      "distance_km": 1.2,
      "battery_availability": {
        "has_cr2450": true,
        "availability": "高"
      }
    }
  ],
  "count": 4
}
```

---

### 販売店検索API

```bash
curl -X POST http://localhost:5000/api/dealers/search \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "latitude": 35.6812,
      "longitude": 139.7671
    },
    "service_type": "key_battery",
    "radius_km": 10
  }'
```

**レスポンス例**:
```json
{
  "dealers": [
    {
      "dealer_id": "DEALER-001",
      "name": "トヨタ東京カローラ 新宿店",
      "location": {
        "address": "東京都新宿区西新宿7-10-1"
      },
      "distance_km": 2.3,
      "services": ["電池交換", "キー修理"],
      "business_hours": {
        "service": {
          "weekday": "9:00-18:00"
        }
      }
    }
  ],
  "count": 3
}
```

---

### 販売店予約API

```bash
curl -X POST http://localhost:5000/api/dealers/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "dealer_id": "DEALER-001",
    "service_type": "key_battery",
    "preferred_date": "2026-02-01",
    "preferred_time": "10:00",
    "customer": {
      "name": "山田太郎",
      "phone": "090-1234-5678",
      "email": "yamada@example.com",
      "vehicle": "AQUA 2024"
    },
    "notes": "電池交換希望"
  }'
```

**レスポンス例**:
```json
{
  "reservation": {
    "reservation_id": "RES-A1B2C3D4",
    "dealer": {
      "dealer_id": "DEALER-001",
      "name": "トヨタ東京カローラ 新宿店"
    },
    "appointment": {
      "date": "2026-02-01",
      "time": "10:00"
    },
    "status": "pending"
  },
  "message": "予約が完了しました"
}
```

---

## 🔧 Google Places API設定

### API Key取得手順

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/

2. **プロジェクト作成**
   - 「新しいプロジェクト」をクリック
   - プロジェクト名: `guide-system-api`

3. **Places API有効化**
   - 「APIとサービス」→「ライブラリ」
   - 「Places API」を検索
   - 「有効にする」をクリック

4. **APIキー作成**
   - 「認証情報」→「認証情報を作成」→「APIキー」
   - 作成されたキーをコピー
   - `.env`ファイルの`GOOGLE_PLACES_API_KEY`に設定

5. **APIキー制限（推奨）**
   - 「キーを制限」をクリック
   - 「HTTPリファラー」を選択
   - 許可するURLを設定

---

## 📚 API仕様詳細

### エンドポイント一覧

| メソッド | エンドポイント | 説明 |
|:---------|:--------------|:-----|
| GET | `/` | APIルート |
| GET | `/health` | ヘルスチェック |
| POST | `/api/nearby-stores` | 近隣店舗検索 |
| GET | `/api/stores/<id>` | 店舗詳細 |
| GET | `/api/battery-info` | 電池情報 |
| POST | `/api/dealers/search` | 販売店検索 |
| GET | `/api/dealers/<dealer_id>` | 販売店詳細 |
| POST | `/api/dealers/reserve` | 予約作成 |
| GET | `/api/dealers/reservations/<id>` | 予約詳細 |
| DELETE | `/api/dealers/reservations/<id>` | 予約キャンセル |

---

## 🧪 テスト実行

```bash
# テスト実行
pytest

# カバレッジ付きテスト
pytest --cov=.
```

---

## 🐛 トラブルシューティング

### 1. ModuleNotFoundError

**エラー**:
```
ModuleNotFoundError: No module named 'flask'
```

**解決**:
```bash
# 仮想環境が有効か確認
which python  # Mac/Linux
where python  # Windows

# 依存パッケージ再インストール
pip install -r requirements.txt
```

---

### 2. データベースエラー

**エラー**:
```
sqlalchemy.exc.OperationalError: (sqlite3.OperationalError) no such table: stores
```

**解決**:
```bash
# データベース再初期化
rm guide_system.db  # 既存DBを削除
python init_db.py   # 再作成
```

---

### 3. CORS エラー

**エラー**:
```
Access to fetch at 'http://localhost:5000/api/...' has been blocked by CORS policy
```

**解決**:
- `.env`の`CORS_ORIGINS`を確認
- フロントエンドのURLを設定: `CORS_ORIGINS=http://localhost:3000`

---

## 📈 次のステップ

### フロントエンド統合

```javascript
// React での使用例
const searchNearbyStores = async (location) => {
  const response = await fetch('http://localhost:5000/api/nearby-stores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      location: location,
      item: 'CR2450',
      radius_km: 5
    })
  });
  
  const data = await response.json();
  return data.stores;
};
```

---

### 本番デプロイ

1. **環境変数設定**
   - `FLASK_ENV=production`
   - `SECRET_KEY=強力なシークレットキー`
   - データベースをPostgreSQLに変更

2. **Gunicorn起動**
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

3. **Nginxリバースプロキシ設定**

---

**APIの基盤が完成しました! 🎉**
