# フロントエンド統合ガイド

## 📦 作成したフロントエンドコンポーネント

### 1. スタンドアロン版チャットシステム

**ファイル**: `chat-system.html`

**特徴**:
- 完全に独立したチャットUI
- スマートキーフロー対応
- クイックリプライ機能
- ガイドモーダル表示

**使い方**:
```bash
# ブラウザで開く
start frontend/chat-system.html
```

---

### 2. ガイド統合版チャットシステム

**ファイル**: `guide-chat-integrated.html`

**特徴**:
- JSONガイドコンテンツを動的読み込み
- THEME-001完全対応
- フロー状態管理
- API連携準備完了
- 予約フォーム実装

**使い方**:
```bash
# ブラウザで開く
start frontend/guide-chat-integrated.html
```

---

## 🔗 phase1-mockups.htmlとの統合

### 統合方法

既存の`phase1-mockups.html`のチャット機能を、Journey Graphシステムと統合します。

### ステップ1: チャット機能の拡張

`phase1-mockups.html`の`showChatScreen()`関数を以下のように置き換えます:

```javascript
// THEME-001フロー対応のチャット機能
function showChatScreen() {
    const resultDiv = document.getElementById('searchResult');
    const defaultContent = document.getElementById('defaultContent');
    
    defaultContent.classList.add('hidden');
    
    resultDiv.innerHTML = `
        <div id="chatMessages">
            <!-- ウェルカムメッセージ -->
            <div class="chat-message ai">
                <div class="chat-bubble ai">
                    こんにちは!トヨタ車取扱説明書AIアシスタントです。🚗<br><br>
                    お困りのことがあれば、お気軽にご質問ください。<br><br>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
                        <div class="quick-reply" onclick="startSmartKeyFlow()">
                            🔑 スマートキーでドアが開かない
                        </div>
                        <div class="quick-reply" onclick="handleQuickReply('電池交換の方法')">
                            🔋 電池交換の方法
                        </div>
                        <div class="quick-reply" onclick="handleQuickReply('機械キーの使い方')">
                            🔧 機械キーの使い方
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- チャット入力欄 -->
        <div id="chatInputContainer" style="position: sticky; bottom: 0; background: #0f3460; padding: 15px 0; margin-top: 20px; border-top: 1px solid rgba(79, 172, 254, 0.3);">
            <div style="display: flex; gap: 10px; align-items: flex-end;">
                <textarea id="chatInput" 
                          placeholder="質問を入力..." 
                          style="flex: 1; background: rgba(45, 53, 97, 0.6); color: #e0e0e0; border: 1px solid rgba(79, 172, 254, 0.3); border-radius: 12px; padding: 12px; font-size: 0.95em; resize: none; min-height: 45px; max-height: 100px; font-family: inherit;"
                          rows="1"
                          onkeypress="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendChatMessage(); }"></textarea>
                <button onclick="sendChatMessage()" 
                        class="button" 
                        style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #0f3460; padding: 12px 20px; border: none; cursor: pointer; font-weight: 600; height: 45px;">
                    送信 📤
                </button>
            </div>
            <div style="font-size: 0.8em; color: #888; margin-top: 8px;">
                💡 Shift+Enterで改行 | 現在地: <span id="currentNodeLabel">START</span>
            </div>
        </div>
    `;
    
    resultDiv.classList.remove('hidden');
    document.getElementById('homeContent').scrollTop = 0;
}
```

---

### ステップ2: スマートキーフロー関数を追加

`phase1-mockups.html`のスクリプト部分に以下を追加:

```javascript
// フロー状態管理
let currentFlow = {
    theme: 'THEME-001',
    currentNode: 'NODE-START',
    context: {}
};

// スマートキーフロー開始
async function startSmartKeyFlow() {
    const chatMessages = document.getElementById('chatMessages');
    addAIMessage(`<strong>スマートキーでドアが開かない状況ですね</strong><br><br>

THEME-001のフローで診断します。<br><br>

<div style="background: rgba(45, 53, 97, 0.4); padding: 15px; border-radius: 12px; margin: 15px 0;">
    <div style="margin: 8px 0;">▶ START: 問題発生</div>
    <div style="background: rgba(79, 172, 254, 0.2); padding: 6px 12px; border-radius: 8px; border: 1px solid #4facfe; margin: 8px 0;">
        ▶ CHECK-001: インジケーター確認 ←現在地
    </div>
    <div style="margin: 8px 0;">▶ 次のステップ...</div>
</div>

スマートキーのボタンを押したとき、インジケーターランプ（小さな赤いランプ）は点灯しますか?<br><br>

<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;">
    <div class="quick-reply" onclick="handleIndicatorCheck('yes')">✅ はい、点灯します</div>
    <div class="quick-reply" onclick="handleIndicatorCheck('no')">❌ いいえ、点灯しません</div>
    <div class="quick-reply" onclick="handleIndicatorCheck('unknown')">❓ わかりません</div>
</div>`);
    
    updateNodeLabel('インジケーター確認');
}

// その他の関数（chat-system.htmlから移植）
// ...
```

---

## 🎯 統合のアプローチ

### オプション1: 既存ファイルを拡張（推奨）

`phase1-mockups.html`に機能を追加:

**メリット**:
- 既存のデザインを維持
- 他の画面との一貫性
- 1ファイルで完結

**手順**:
1. チャット関連のJavaScript関数を追加
2. CSS スタイルを追加
3. ガイドモーダルを追加

---

### オプション2: 新規ファイルとして分離

`guide-chat-integrated.html`を独立させる:

**メリット**:
- コードが整理される
- テスト・デバッグが容易
- モジュール化

**手順**:
1. スタンドアロンとして開発
2. 完成後にphase1-mockups.htmlに統合

---

## 📊 統合後の機能一覧

### チャット機能

| 機能 | 状態 | 説明 |
|:-----|:-----|:-----|
| ウェルカムメッセージ | ✅ | 初回表示時の案内 |
| クイックリプライ | ✅ | ワンタップで回答 |
| フロー状態管理 | ✅ | 現在地を表示 |
| ガイド表示 | ✅ | モーダルで詳細表示 |
| 店舗検索 | ✅ | API連携（デモ含む） |
| 予約フォーム | ✅ | 入力フォーム実装 |
| チャット履歴保存 | ✅ | デバッグ機能 |

---

### THEME-001フロー対応

| ノード | 実装状態 | 機能 |
|:-------|:---------|:-----|
| START | ✅ | ウェルカムメッセージ |
| CHECK-001 | ✅ | インジケーター確認 |
| NODE-BATTERY-DEAD | ✅ | 電池切れ対応 |
| NODE-INTERFERENCE | ✅ | 電波干渉対応 |
| NODE-DIY-CHECK | ✅ | 準備物確認 |
| NODE-DIY-EXECUTE | ✅ | 交換手順表示 |
| NODE-PURCHASE | ✅ | 電池購入サポート |
| NODE-DEALER-RESERVE | ✅ | 販売店予約 |
| NODE-RESOLVED | ✅ | 解決完了 |

---

### ガイド連携

| ガイドID | タイトル | 統合状態 |
|:---------|:---------|:---------|
| GUIDE-001 | 機械キーの取り出し方 | ✅ JSON読み込み |
| GUIDE-003 | 事前準備物 | ✅ JSON読み込み |
| GUIDE-004 | 電池購入方法 | ✅ JSON読み込み |
| GUIDE-005 | 電池交換手順 | ✅ JSON読み込み |
| GUIDE-006 | 販売店予約 | ✅ JSON読み込み |
| GUIDE-008 | 電波干渉対応 | ✅ JSON読み込み |
| GUIDE-009 | キー修理 | ✅ JSON読み込み |
| GUIDE-013 | 予防策・点検 | ✅ JSON読み込み |

---

## 🚀 デプロイ手順

### 開発環境

```bash
# 1. フロントエンドファイルの配置
frontend/
├── chat-system.html              # スタンドアロン版
├── guide-chat-integrated.html    # ガイド統合版
└── INTEGRATION_GUIDE.md          # 本ファイル

# 2. APIサーバー起動
cd api
python app.py
# → http://localhost:5000

# 3. フロントエンド確認
start frontend/guide-chat-integrated.html
```

---

### 本番環境

```bash
# 1. 静的ファイルホスティング
# - Netlify / Vercel / GitHub Pages など

# 2. APIサーバーデプロイ
# - Heroku / AWS / Google Cloud など

# 3. CORS設定
# APIのCORS_ORIGINSにフロントエンドURLを設定
```

---

## 🧪 テストシナリオ

### シナリオ1: 電池切れ → DIY交換

```
1. ユーザー: 「スマートキーでドアが開かない」
   → AI: インジケーター確認

2. ユーザー: 「いいえ、点灯しません」
   → AI: 電池切れ診断 + 選択肢提示

3. ユーザー: 「自分で交換する」
   → AI: 準備物確認

4. ユーザー: 「電池が必要です」
   → AI: 近隣店舗検索（API連携）

5. ユーザー: 店舗で購入
   → AI: 交換手順を表示（GUIDE-005）

6. ユーザー: 「交換完了しました」
   → AI: 動作確認

7. ユーザー: 「正常に動作します」
   → AI: 解決完了 + 予防策案内
```

---

### シナリオ2: 電池切れ → 販売店予約

```
1. ユーザー: 「スマートキーでドアが開かない」
   → AI: インジケーター確認

2. ユーザー: 「いいえ、点灯しません」
   → AI: 電池切れ診断 + 選択肢提示

3. ユーザー: 「販売店に依頼する」
   → AI: 近隣販売店検索（API連携）

4. ユーザー: 販売店を選択
   → AI: 予約フォーム表示

5. ユーザー: フォーム入力・送信
   → AI: 予約確認（予約番号発行）

6. AI: 解決完了
```

---

### シナリオ3: 電波干渉

```
1. ユーザー: 「スマートキーでドアが開かない」
   → AI: インジケーター確認

2. ユーザー: 「はい、点灯します」
   → AI: 電波干渉診断 + 対処法提示

3. ユーザー: 「改善しました」
   → AI: 解決完了 + 予防策案内
```

---

## 🎨 UIコンポーネント設計

### チャットバブル

```html
<!-- AIメッセージ -->
<div class="chat-message ai">
    <div class="chat-avatar ai">🤖</div>
    <div class="chat-bubble ai">
        メッセージ内容
    </div>
</div>

<!-- ユーザーメッセージ -->
<div class="chat-message user">
    <div class="chat-bubble user">
        メッセージ内容
    </div>
    <div class="chat-avatar user">👤</div>
</div>
```

---

### クイックリプライ

```html
<div class="quick-reply-container">
    <div class="quick-reply" onclick="handleAction()">
        ✅ はい
    </div>
    <div class="quick-reply" onclick="handleAction()">
        ❌ いいえ
    </div>
</div>
```

---

### ガイドリンク

```html
<div class="guide-link" onclick="showGuideInteractive('GUIDE-001')">
    📖 機械キーの取り出し方
</div>
```

---

### アクションボタン

```html
<div class="action-button" onclick="findNearbyStores()">
    🏪 近くの店舗を探す
</div>
```

---

## 📱 レスポンシブデザイン

### モバイルファースト

```css
/* モバイル（375px）*/
.mobile-frame {
    max-width: 375px;
    height: 667px;
}

/* タブレット（768px以上）*/
@media (min-width: 768px) {
    .mobile-frame {
        max-width: 450px;
        height: 800px;
    }
}

/* デスクトップ（1024px以上）*/
@media (min-width: 1024px) {
    /* サイドバイサイド表示など */
}
```

---

## 🔧 JavaScript API統合

### ガイドコンテンツ読み込み

```javascript
async function loadGuideContent(guideId) {
    const GUIDE_PATH = '../docs/journey/csv_data/guide_content/';
    
    try {
        const response = await fetch(`${GUIDE_PATH}${guideId}_content.json`);
        const guide = await response.json();
        return guide;
    } catch (error) {
        console.error(`Failed to load ${guideId}:`, error);
        return null;
    }
}

// 使用例
const guide = await loadGuideContent('GUIDE-005');
if (guide) {
    displayGuide(guide);
}
```

---

### API連携

```javascript
// 近隣店舗検索
async function searchNearbyStores(latitude, longitude) {
    const response = await fetch('http://localhost:5000/api/nearby-stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            location: { latitude, longitude },
            item: 'CR2450',
            radius_km: 5
        })
    });
    
    return await response.json();
}

// 販売店予約
async function createReservation(reservationData) {
    const response = await fetch('http://localhost:5000/api/dealers/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
    });
    
    return await response.json();
}
```

---

## 📊 データフロー

```
ユーザー入力
    ↓
フロー判定（JavaScript）
    ↓
┌─────────────┬─────────────┐
│ ガイド表示  │  API呼び出し │
│ （JSON）    │  （REST）    │
└──────┬──────┴──────┬───────┘
       ↓              ↓
   ガイドモーダル  店舗/予約情報
       ↓              ↓
   ユーザーアクション
       ↓
   次のフロー判定
```

---

## ✅ 完成チェックリスト

### フロントエンド実装

- [x] チャットUI実装
- [x] フロー状態管理
- [x] クイックリプライ
- [x] ガイドモーダル
- [x] 店舗検索UI
- [x] 予約フォーム
- [x] API連携コード

### システム統合

- [x] THEME-001フロー実装
- [x] JSONガイド読み込み
- [x] API エンドポイント接続
- [x] エラーハンドリング
- [x] デモデータフォールバック

### ドキュメント

- [x] 統合ガイド作成
- [x] セットアップ手順
- [x] テストシナリオ
- [x] API仕様

---

## 🎯 次のステップ

### 即座に確認できること

```bash
# スタンドアロン版チャットを開く
start frontend/guide-chat-integrated.html
```

### 統合作業

1. **phase1-mockups.htmlへの統合**
   - チャット関数をコピー
   - CSSスタイルを追加
   - モーダルを追加

2. **APIサーバー起動**
   ```bash
   cd api
   python init_db.py
   python app.py
   ```

3. **動作確認**
   - 各フローをテスト
   - API連携テスト
   - ガイド表示テスト

---

## 💡 実装のポイント

### 1. フロー状態管理

```javascript
let currentFlow = {
    theme: 'THEME-001',          // テーマID
    currentNode: 'NODE-START',   // 現在のノード
    context: {                   // コンテキスト情報
        hasIndicator: null,
        hasBattery: null,
        preferredAction: null
    }
};
```

### 2. ガイドキャッシング

```javascript
let guidesCache = {};

async function loadGuideContent(guideId) {
    if (guidesCache[guideId]) {
        return guidesCache[guideId];  // キャッシュから返す
    }
    
    const guide = await fetch(...);
    guidesCache[guideId] = guide;
    return guide;
}
```

### 3. エラーハンドリング

```javascript
try {
    const stores = await fetchNearbyStores(lat, lng);
    displayNearbyStores(stores);
} catch (error) {
    console.error('API Error:', error);
    displayNearbyStoresDemo();  // デモデータにフォールバック
}
```

---

**フロントエンド実装が完了しました! 🎉**

**次は、実際にブラウザで動作確認してみましょう!**
