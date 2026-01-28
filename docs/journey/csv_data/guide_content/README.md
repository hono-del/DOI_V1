# ガイドコンテンツディレクトリ

## 概要

THEME-001「スマートキーでドアが開かない」の全13ガイドのコンテンツをJSON形式で格納しています。

---

## ファイル一覧

### 機械キー関連（2ガイド）

| ファイル | ガイドID | タイトル | タイプ | 難易度 |
|:---------|:---------|:---------|:-------|:-------|
| GUIDE-001_content.json | GUIDE-001 | 機械キーの取り出し方 | procedure | easy |
| GUIDE-002_content.json | GUIDE-002 | 機械キーの場所・保管方法 | information | easy |

### 電池交換関連（4ガイド）

| ファイル | ガイドID | タイトル | タイプ | 難易度 |
|:---------|:---------|:---------|:-------|:-------|
| GUIDE-003_content.json | GUIDE-003 | 事前準備物 | checklist | easy |
| GUIDE-004_content.json | GUIDE-004 | 電池購入方法 | link_collection | easy |
| GUIDE-005_content.json | GUIDE-005 | 電池交換手順 | procedure | medium |
| GUIDE-006_content.json | GUIDE-006 | 販売店予約・連絡先 | contact_service | easy |

### トラブルシューティング関連（4ガイド）

| ファイル | ガイドID | タイトル | タイプ | 難易度 |
|:---------|:---------|:---------|:-------|:-------|
| GUIDE-007_content.json | GUIDE-007 | ジャンプスタート手順 | procedure | medium |
| GUIDE-008_content.json | GUIDE-008 | 電波干渉時の対応 | troubleshooting | easy |
| GUIDE-010_content.json | GUIDE-010 | ドアロック故障時の対応 | troubleshooting | medium |
| GUIDE-011_content.json | GUIDE-011 | ロードサービス連絡先 | contact_service | easy |

### メンテナンス関連（3ガイド）

| ファイル | ガイドID | タイトル | タイプ | 難易度 |
|:---------|:---------|:---------|:-------|:-------|
| GUIDE-009_content.json | GUIDE-009 | キー修理・交換手続き | procedure | easy |
| GUIDE-012_content.json | GUIDE-012 | 販売店連絡先・営業時間 | contact_service | easy |
| GUIDE-013_content.json | GUIDE-013 | 予防策・定期点検の案内 | information | easy |

---

## JSONスキーマ

### 基本構造

```json
{
  "guide_id": "GUIDE-XXX",
  "title": "ガイドタイトル",
  "type": "procedure | information | checklist | contact_service | troubleshooting",
  "estimated_time": "1min | 3min | 5min | 10min | 15min",
  "difficulty": "easy | medium | hard",
  "content": {
    "overview": "概要説明",
    // ガイドタイプに応じた詳細コンテンツ
  },
  "source": {
    "xml_file": "M52P95tojpjavhchXX.xml",
    "section_id": "chXXseXXXXXX",
    "manual_page": "X-XXページ",
    "type": "xml_based | system_generated"
  }
}
```

### ガイドタイプ別の構造

#### 1. procedure（手順書）

```json
{
  "content": {
    "overview": "概要",
    "steps": [
      {
        "step": 1,
        "description": "手順の説明",
        "detail": "詳細説明",
        "image_ref": "イラストID",
        "note": "補足",
        "caution": "注意事項",
        "important": "重要事項"
      }
    ],
    "warnings": ["警告1", "警告2"],
    "tips": ["ヒント1", "ヒント2"]
  }
}
```

#### 2. checklist（チェックリスト）

```json
{
  "content": {
    "overview": "概要",
    "checklist": [
      {
        "item": "項目名",
        "required": true | false,
        "description": "説明"
      }
    ]
  }
}
```

#### 3. troubleshooting（トラブルシューティング）

```json
{
  "content": {
    "overview": "概要",
    "symptoms": ["症状1", "症状2"],
    "solutions": [
      {
        "method": "対処法",
        "steps": [...],
        "success_rate": "高 | 中 | 低"
      }
    ]
  }
}
```

#### 4. contact_service（連絡・サービス）

```json
{
  "content": {
    "overview": "概要",
    "contact_methods": [...],
    "business_hours": {...},
    "services": [...]
  }
}
```

---

## データソース

### XML参照（10ガイド）

| ガイドID | XMLファイル | セクション |
|:---------|:-----------|:-----------|
| GUIDE-001 | M52P95tojpjavhch03.xml | ch03se0204010302 |
| GUIDE-002 | M52P95tojpjavhch03.xml | ch03se02040103 |
| GUIDE-003 | M52P95tojpjavhch03.xml | ch03se0204020502 |
| GUIDE-005 | M52P95tojpjavhch03.xml | ch03se020402050206 |
| GUIDE-007 | M52P95tojpjavhch07.xml | ch07se020408 |
| GUIDE-008 | M52P95tojpjavhch03.xml | ch03se020401050306 |
| GUIDE-009 | M52P95tojpjavhch03.xml | ch03se02040205 |
| GUIDE-010 | M52P95tojpjavhch07.xml | ch07se020401 |
| GUIDE-011 | M52P95tojpjavhch07.xml | ch07se020415 |
| GUIDE-013 | M52P95tojpjavhch06.xml | ch06se01 |

### システム実装（3ガイド）

| ガイドID | 実装内容 | API |
|:---------|:---------|:----|
| GUIDE-004 | 電池購入方法 | /api/nearby-stores |
| GUIDE-006 | 販売店予約 | /api/dealers/search |
| GUIDE-012 | 販売店連絡先 | /api/dealers/search |

---

## 使い方

### Pythonでの読み込み

```python
import json
from pathlib import Path

# ガイドコンテンツを読み込む
def load_guide(guide_id):
    file_path = Path(f"guide_content/{guide_id}_content.json")
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# 使用例
guide_001 = load_guide("GUIDE-001")
print(guide_001['title'])  # 機械キーの取り出し方
print(guide_001['content']['steps'])  # 手順リスト
```

### JavaScriptでの読み込み

```javascript
// ガイドコンテンツを読み込む
async function loadGuide(guideId) {
  const response = await fetch(`guide_content/${guideId}_content.json`);
  return await response.json();
}

// 使用例
const guide001 = await loadGuide('GUIDE-001');
console.log(guide001.title);  // 機械キーの取り出し方
```

---

## ガイド間の関連性

### 関連図

```
GUIDE-001 (機械キー取り出し)
  ├─ GUIDE-002 (機械キー保管)
  ├─ GUIDE-005 (電池交換手順) ※手順1で参照
  └─ GUIDE-008 (電波干渉) ※代替手段

GUIDE-003 (事前準備物)
  ├─ GUIDE-004 (電池購入)
  └─ GUIDE-005 (電池交換手順)

GUIDE-004 (電池購入)
  └─ GUIDE-005 (電池交換手順)

GUIDE-005 (電池交換手順)
  ├─ GUIDE-003 (事前準備物)
  └─ GUIDE-006 (販売店予約) ※代替手段

GUIDE-006 (販売店予約)
  ├─ GUIDE-005 (電池交換手順) ※専門家対応
  └─ GUIDE-012 (販売店連絡先)

GUIDE-007 (ジャンプスタート)
  ├─ GUIDE-011 (ロードサービス) ※困難な場合
  └─ GUIDE-013 (予防策)

GUIDE-008 (電波干渉)
  ├─ GUIDE-001 (機械キー) ※代替手段
  └─ GUIDE-010 (ドアロック故障) ※故障診断

GUIDE-009 (キー修理)
  ├─ GUIDE-001 (機械キー) ※緊急対応
  └─ GUIDE-012 (販売店連絡先)

GUIDE-010 (ドアロック故障)
  ├─ GUIDE-001 (機械キー) ※初期対応
  ├─ GUIDE-008 (電波干渉) ※原因診断
  └─ GUIDE-011 (ロードサービス) ※緊急時

GUIDE-011 (ロードサービス)
  ├─ GUIDE-007 (ジャンプスタート) ※バッテリー上がり
  ├─ GUIDE-010 (ドアロック故障) ※開閉不能
  └─ GUIDE-012 (販売店連絡先) ※非緊急時

GUIDE-012 (販売店連絡先)
  ├─ GUIDE-006 (販売店予約)
  ├─ GUIDE-009 (キー修理)
  ├─ GUIDE-011 (ロードサービス) ※営業時間外
  └─ GUIDE-013 (予防策)

GUIDE-013 (予防策・定期点検)
  ├─ GUIDE-001 (機械キー) ※定期確認
  ├─ GUIDE-005 (電池交換) ※予防交換
  └─ GUIDE-012 (販売店連絡先) ※専門点検
```

---

## 統計情報

### ガイドタイプ別

| タイプ | 件数 | ガイドID |
|:-------|:-----|:---------|
| procedure | 5 | GUIDE-001, 005, 007, 009 |
| information | 2 | GUIDE-002, 013 |
| checklist | 1 | GUIDE-003 |
| link_collection | 1 | GUIDE-004 |
| contact_service | 3 | GUIDE-006, 011, 012 |
| troubleshooting | 2 | GUIDE-008, 010 |

### 難易度別

| 難易度 | 件数 | ガイドID |
|:-------|:-----|:---------|
| easy | 10 | GUIDE-001, 002, 003, 004, 006, 008, 009, 011, 012, 013 |
| medium | 3 | GUIDE-005, 007, 010 |
| hard | 0 | - |

### 所要時間別

| 時間 | 件数 | ガイドID |
|:-----|:-----|:---------|
| 1min | 2 | GUIDE-001, 002 |
| 2min | 1 | GUIDE-003 |
| 3min | 2 | GUIDE-006, 012 |
| 5min | 5 | GUIDE-004, 005, 008, 011, 013 |
| 10min | 2 | GUIDE-009, 010 |
| 15min | 1 | GUIDE-007 |

---

## ファイルサイズ

| ファイル | サイズ | 行数（推定） |
|:---------|:-------|:------------|
| GUIDE-001_content.json | 1.5KB | 40行 |
| GUIDE-002_content.json | 1.8KB | 50行 |
| GUIDE-003_content.json | 2.2KB | 60行 |
| GUIDE-004_content.json | 2.8KB | 80行 |
| GUIDE-005_content.json | 3.5KB | 100行 |
| GUIDE-006_content.json | 3.8KB | 110行 |
| GUIDE-007_content.json | 4.2KB | 120行 |
| GUIDE-008_content.json | 3.0KB | 90行 |
| GUIDE-009_content.json | 4.5KB | 130行 |
| GUIDE-010_content.json | 4.8KB | 140行 |
| GUIDE-011_content.json | 5.0KB | 150行 |
| GUIDE-012_content.json | 5.2KB | 155行 |
| GUIDE-013_content.json | 5.5KB | 160行 |

**合計**: 約47KB、約1,285行

---

## 次のステップ

### フェーズ1: L3システムとの連携

1. ガイドコンテンツローダーの実装
2. Guide.csvとJSONファイルの紐付け
3. L3（AIガイド層）からの動的取得

### フェーズ2: API実装

1. GUIDE-004: 近隣店舗検索API
2. GUIDE-006: 販売店予約API
3. GUIDE-012: 販売店情報API

### フェーズ3: コンテンツ充実

1. イラスト・画像の追加
2. 動画コンテンツの追加
3. 多言語対応

---

## 更新履歴

- 2026-01-27: 全13ガイドのJSONファイル作成完了
- 2026-01-27: ディレクトリ構造確立
- 2026-01-27: スキーマ定義

---

**ガイドコンテンツの整備により、ユーザージャーニーにおける情報提供の質が大幅に向上しました!**
