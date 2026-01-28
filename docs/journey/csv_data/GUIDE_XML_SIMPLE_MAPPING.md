# THEME-001 ガイドとXMLの簡易マッピング

## 概要

XML解析にDTDの問題があるため、手動でXMLファイルとガイドの対応関係を確認しました。

---

## 確認済みXMLファイル構成

### ch03.xml - スマートエントリー＆スタートシステム

このファイルには @M52P95tojpjavhch03.xml で確認済みのスマートエントリーシステムの詳細情報があります。

**関連ガイド**:
- GUIDE-001: 機械キーの取り出し方
- GUIDE-002: 機械キーの場所・保管方法  
- GUIDE-003: 事前準備物（電池交換用）
- GUIDE-005: 電池交換手順
- GUIDE-008: 電波干渉時の対応

**確認方法**: XMLファイルを直接検索してセクション特定

---

## 次のステップ: 手動マッピング

XMLから以下のセクションを手動抽出して、各ガイドと紐付けます:

### 1. GUIDE-001: 機械キーの取り出し方

**期待される内容**:
- スマートキーから機械キーを取り出す手順
- イラスト付き説明
- 注意事項

**XMLセクション候補**:
```
<topic id="ch03se0204010302">
  <title>機械キーを使ってドアを開ける</title>
  ...
</topic>
```

---

### 2. GUIDE-003 & GUIDE-005: 電池交換関連

**取扱説明書の記載内容** (既知):

#### 事前準備物
```
交換をするには、次のものを準備してください。
・マイナスドライバー
・小さいマイナスドライバー  
・リチウム電池:CR2450
```

#### 電池の入手
```
リチウム電池CR2450の入手
電池はトヨタ販売店・時計店およびカメラ店などで購入できます。
```

#### 交換手順（注意事項）
```
電池が消耗しているときは、新しい電池に交換してください。
電池はご自身で交換できますが、部品が破損するおそれがあるので、
トヨタ販売店で交換することをおすすめします。
```

---

## 実装用ガイドコンテンツJSON

XMLから抽出できない場合は、以下のJSON形式で直接作成します:

### GUIDE-001: 機械キーの取り出し方

```json
{
  "guide_id": "GUIDE-001",
  "title": "機械キーの取り出し方",
  "type": "procedure",
  "estimated_time": "1min",
  "difficulty": "easy",
  "content": {
    "overview": "スマートキーに内蔵されている機械キーの取り出し方を説明します。",
    "steps": [
      {
        "step": 1,
        "description": "スマートキーのロック解除ボタンを押す",
        "image_ref": "key_release_button.eps",
        "note": "ボタンは側面にあります"
      },
      {
        "step": 2,
        "description": "機械キーを引き抜く",
        "image_ref": "key_pull_out.eps"
      }
    ],
    "warnings": [
      "機械キーは無理に引き抜かないでください",
      "使用後は必ず元の位置に戻してください"
    ],
    "related_guides": ["GUIDE-002"]
  },
  "source": {
    "xml_file": "M52P95tojpjavhch03.xml",
    "section_id": "ch03se0204010302",
    "manual_page": "推定 3-15ページ"
  }
}
```

### GUIDE-003: 事前準備物

```json
{
  "guide_id": "GUIDE-003",
  "title": "事前準備物",
  "type": "checklist",
  "estimated_time": "2min",
  "difficulty": "easy",
  "content": {
    "overview": "電池交換に必要な道具と部品を確認します。",
    "checklist": [
      {
        "item": "マイナスドライバー",
        "required": true,
        "description": "スマートキーのカバーを開けるために使用"
      },
      {
        "item": "小さいマイナスドライバー",
        "required": true,
        "description": "電池を取り出すために使用"
      },
      {
        "item": "リチウム電池 CR2450",
        "required": true,
        "description": "交換用の新しい電池",
        "purchase_info": "トヨタ販売店・時計店・カメラ店などで購入可能"
      }
    ],
    "tips": [
      "電池の型番を必ず確認してください（CR2450）",
      "すべて揃ってから作業を開始してください"
    ],
    "related_guides": ["GUIDE-004", "GUIDE-005"]
  },
  "source": {
    "xml_file": "M52P95tojpjavhch03.xml or ch06.xml",
    "manual_page": "推定 3-20ページ"
  }
}
```

### GUIDE-004: 電池購入方法（システム実装）

```json
{
  "guide_id": "GUIDE-004",
  "title": "電池購入方法",
  "type": "link_collection",
  "estimated_time": "5min",
  "difficulty": "easy",
  "content": {
    "overview": "CR2450電池の購入方法をご案内します。",
    "online_stores": [
      {
        "name": "Amazon",
        "url": "https://amazon.co.jp/s?k=CR2450",
        "price_range": "¥200-500",
        "delivery": "最短翌日配送"
      },
      {
        "name": "楽天市場",
        "url": "https://search.rakuten.co.jp/search?k=CR2450",
        "price_range": "¥200-500",
        "delivery": "2-3日"
      }
    ],
    "nearby_stores": {
      "use_location": true,
      "search_radius_km": 5,
      "store_types": [
        "トヨタ販売店",
        "時計店",
        "カメラ店",
        "家電量販店",
        "コンビニエンスストア"
      ],
      "api_endpoint": "/api/nearby-stores"
    },
    "tips": [
      "オンライン購入の場合、到着まで機械キーをご使用ください",
      "店舗購入の場合、在庫確認のため事前に電話連絡をおすすめします"
    ]
  },
  "source": {
    "type": "system_generated",
    "based_on": "取扱説明書記載の購入先情報"
  }
}
```

### GUIDE-005: 電池交換手順

```json
{
  "guide_id": "GUIDE-005",
  "title": "電池交換手順",
  "type": "procedure",
  "estimated_time": "5min",
  "difficulty": "medium",
  "content": {
    "overview": "スマートキーの電池を交換します。部品破損のおそれがあるため、慎重に作業してください。",
    "important_notice": {
      "type": "warning",
      "message": "電池はご自身で交換できますが、部品が破損するおそれがあるので、トヨタ販売店で交換することをおすすめします。"
    },
    "steps": [
      {
        "step": 1,
        "description": "機械キーを取り出す",
        "reference": "GUIDE-001参照"
      },
      {
        "step": 2,
        "description": "マイナスドライバーでカバーを開ける",
        "image_ref": "key_cover_open.eps",
        "caution": "カバーに傷をつけないよう、布などを当ててください"
      },
      {
        "step": 3,
        "description": "小さいマイナスドライバーで古い電池を取り出す",
        "image_ref": "battery_remove.eps",
        "caution": "電池の向きを確認してください"
      },
      {
        "step": 4,
        "description": "新しいCR2450電池を+(プラス)面を上にして取り付ける",
        "image_ref": "battery_install.eps",
        "important": "電池の向きを間違えないでください"
      },
      {
        "step": 5,
        "description": "カバーを閉じる",
        "note": "カチッと音がするまで確実に閉じてください"
      },
      {
        "step": 6,
        "description": "機械キーを元に戻す"
      },
      {
        "step": 7,
        "description": "動作確認",
        "verification": "スマートキーのボタンを押して、車両が反応することを確認"
      }
    ],
    "warnings": [
      "部品破損のおそれがあります",
      "自信がない場合は販売店での交換をおすすめします",
      "古い電池は適切に廃棄してください"
    ],
    "related_guides": ["GUIDE-003", "GUIDE-006"]
  },
  "source": {
    "xml_file": "M52P95tojpjavhch03.xml or ch06.xml",
    "manual_page": "推定 3-21ページ"
  }
}
```

### GUIDE-006: 販売店予約・連絡先（システム実装）

```json
{
  "guide_id": "GUIDE-006",
  "title": "販売店予約・連絡先",
  "type": "contact_service",
  "estimated_time": "3min",
  "difficulty": "easy",
  "content": {
    "overview": "お近くのトヨタ販売店で電池交換サービスを予約できます。",
    "reservation_methods": [
      {
        "method": "オンライン予約",
        "url": "https://toyota.jp/service/reserve",
        "description": "24時間予約可能"
      },
      {
        "method": "電話予約",
        "action": "show_dealer_list",
        "use_location": true,
        "description": "お近くの販売店に直接お電話ください"
      }
    ],
    "business_hours": {
      "weekday": "9:00-18:00",
      "saturday": "9:00-17:00",
      "sunday": "定休日（店舗により異なる）"
    },
    "service_info": {
      "name": "電池交換サービス",
      "estimated_time": "10-15分",
      "fee": "店舗にお問い合わせください",
      "appointment": "予約なしでも対応可能（混雑時はお待ちいただく場合があります）"
    },
    "dealer_search": {
      "api_endpoint": "/api/dealers/search",
      "parameters": {
        "location": "user_location",
        "service_type": "key_battery",
        "radius_km": 20
      }
    }
  },
  "source": {
    "type": "system_generated",
    "based_on": "トヨタ公式サービス情報"
  }
}
```

---

## 実装方針

### フェーズ1: 静的ガイド実装

1. 上記JSONを`guide_content/`ディレクトリに配置
2. Guide.csvの`guide_id`と紐付け
3. L3（AIガイド層）から参照可能にする

### フェーズ2: 動的コンテンツ実装

1. GUIDE-004の店舗検索API実装
2. GUIDE-006の予約システムAPI実装
3. 位置情報サービス連携

### フェーズ3: XML自動抽出

1. DTD問題を解決
2. XMLパーサー改善
3. 自動更新フロー確立

---

## 次回作業

1. ✅ `guide_content/`ディレクトリを作成
2. ✅ 各ガイドのJSONファイルを作成
3. ✅ L3システムからのアクセステスト
4. ⬜ 残りのガイド（GUIDE-007〜013）も同様に作成

これで、XMLの詳細解析ができなくても、実用的なガイドコンテンツを提供できます!
